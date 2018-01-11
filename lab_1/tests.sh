errorCode=1
succesCode=0
appPath="./lab_1.exe"
output=""

function shouldReturnErrorIfArgs {
	{($appPath $1)} &> /dev/null
	if [ $? != $errorCode ]; then failed
	else passed 
	fi
	echo " with arguments: " $1
}

function shouldNotReturnErrorIfArgs {
	{($appPath $1)} &> /dev/null
	if [ $? != $succesCode ]; then failed
	else passed 
	fi
	echo " with arguments: " $1
}

function failed {
	echo -n "	[ ] "
}

function passed {
	echo -n "	[+] "
}

echo "Program ($appPath)"

echo "  should return error code"
shouldReturnErrorIfArgs ""
shouldReturnErrorIfArgs "2"
shouldReturnErrorIfArgs "1 2"
shouldReturnErrorIfArgs "2 3 3 4"
shouldReturnErrorIfArgs "2 3 -3"
shouldReturnErrorIfArgs "sd"
shouldReturnErrorIfArgs "sd sd"
shouldReturnErrorIfArgs "sd sd ds"
shouldReturnErrorIfArgs "1 2 sd"
shouldReturnErrorIfArgs "9999999999999999999999999999999999999999 1 1"
echo ""

echo "  should not return error code"
shouldNotReturnErrorIfArgs "2 3 3"
shouldNotReturnErrorIfArgs "2.23 3.1 3.04"
shouldNotReturnErrorIfArgs "0 2 3"
echo ""