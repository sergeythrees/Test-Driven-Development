const request = require('request');
const cheerio = require('cheerio');
const validator = require('validator');
const commandLineArgs = require('command-line-args');
const fs = require('fs');
const HttpStatus = require('http-status-codes');

const Crawler = require("js-crawler");

const config = {
	allLinksFilename: 'all-links.txt',
	brokenLinksFilename: 'broken-links.txt',
	optionDefinitions: [{name: 'url', alias: 'u', type: String}]
};

let allLinksFromPage = [];
let brokenLinks = [];

const statusWhiteList = [
	HttpStatus.TOO_MANY_REQUESTS,
];

const options = commandLineArgs(config.optionDefinitions);
if (!options.hasOwnProperty('url'))
{
	console.log('URL ссылка не указана');
	process.exit(1);
}

let extractDomain = (url) => {
	let domain;
	if (url.indexOf("://") > -1)
	{
		domain = url.split('/')[2];
	}
	else
	{
		domain = url.split('/')[0];
	}
	domain = domain.split(':')[0];
	domain = domain.split('?')[0];
	return domain;
};

let targetUrl = options.url;
let targetDomain = extractDomain(targetUrl);
if (!validator.isURL(targetUrl))
{
	console.log('URL ссылка указана неверно');
	process.exit(2);
}

const crawler = new Crawler().configure({
	shouldCrawl: function(url) {
		return (url.indexOf(targetDomain) > 0);
	},
	ignoreRelative: false,
	depth: 2
});

const prepareLink = (link, targetDomain) => {
	link = String(link);
	if (!validator.isURL(link) || link.indexOf('http') !== 0)
	{
		link = link[0] == "/" ? link : "/" + link;
		return `http://${targetDomain}${link}`
	}
	return link;
};

const pushLink = (arr, pageUrl, pageStatus) => {
	let statusText = "Unknown status";
	if (pageStatus)
	{
		try
		{
			statusText = HttpStatus.getStatusText(pageStatus);
		}
		catch (err) {}
		arr.push({url: pageUrl, status: ` -- ${pageStatus} (${statusText})`});
	}
	else
	{
		allLinksFromPage.push({url: pageUrl, status: ` -- ${pageStatus} (${statusText})`});
	}
};

const removeDuplicates = (arr, key) => {
	if (!(arr instanceof Array) || key && typeof key !== 'string') {
		return false;
	}

	if (key && typeof key === 'string') {
		return arr.filter(function (obj, index, arr) {
			return arr.map(function (mapObj) {
				return mapObj[key];
			}).indexOf(obj[key]) === index;
		});
	} else {
		return arr.filter(function (item, index, arr) {
			return arr.indexOf(item) == index;
		});
	}
};

fs.writeFile(config.allLinksFilename, '');
fs.writeFile(config.brokenLinksFilename, '');

crawler.crawl({
	url: targetUrl,
	success: function(page, crawledUrls) {
		const $ = cheerio.load(page.body);
		const links = $('a');
		$(links).each(function(i, link) {
			const preparedLink = prepareLink($(link).attr('href'), targetDomain);
			new Crawler().configure({depth: 1})
				.crawl({
					url: preparedLink,
					success: (page) => {
						pushLink(allLinksFromPage, page.url, page.status);
					},
					failure: (page) => {
						if (!statusWhiteList.includes(page.status))
						{
							pushLink(brokenLinks, page.url, page.status);
						}
						pushLink(allLinksFromPage, page.url, page.status);
					}
				});
		});
	},
	failure: function(page) {
		if (!statusWhiteList.includes(page.status))
		{
			pushLink(brokenLinks, page.url, page.status);
		}
		pushLink(allLinksFromPage, page.url, page.status);
	},
	finished: function() {
		allLinksFromPage = removeDuplicates(allLinksFromPage, 'url');
		allLinksFromPage.forEach((link) => {
			fs.appendFileSync(config.allLinksFilename,`${link.url} ${link.status}\n`);
		});

		brokenLinks = removeDuplicates(brokenLinks, 'url');
		brokenLinks.forEach((link) => {
			fs.appendFileSync(config.brokenLinksFilename, `${link.url} ${link.status}\n`);
		});

		fs.appendFileSync(config.allLinksFilename, `Всего ссылок: ${allLinksFromPage.length}\n`);
		fs.appendFileSync(config.brokenLinksFilename, `Битых ссылок: ${brokenLinks.length}\n`);
	}
});