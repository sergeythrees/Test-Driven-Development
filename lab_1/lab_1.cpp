#include "stdafx.h"
#include <exception>
#include <vector>
#include <string>
#include <iostream>

using namespace std;

const int ARG_COUNT = 4;

void PrintError(const string & msg);
string GetTriangleType(float a, float b, float c);

int main(int argc, char *argv[])
{
	float a, b, c;

	try
	{
		if (argc != ARG_COUNT)
		{
			throw invalid_argument(
				"Ivalid arguments. Please input trianle sides as program arguments in format: triangle.exe a b c");
		}
		try
		{
			a = stof(string(argv[1]));
			b = stof(string(argv[2]));
			c = stof(string(argv[3]));
		}
		catch (...)
		{
			throw invalid_argument(string("Sides lenghts should be positive numbers not bigger than "
				+ to_string(numeric_limits<float>::max())
				+ ". For decimal numbers use dots"));
		}
		if (a < 0.0 || b < 0.0 || c < 0.0)
		{
			throw invalid_argument("Sides lenghts should be positive numbers");
		}
	}
	catch (const exception &ex)
	{
		cout << ex.what() << endl;
		return EXIT_FAILURE;
	}

	cout << GetTriangleType(a, b, c);
	return EXIT_SUCCESS;
}

void PrintError(const string & msg)
{
	cout << "Error: " << msg << "\n";
}

string GetTriangleType(float a, float b, float c)
{
	if (a == 0.0 || b == 0.0 || c == 0.0 || (a + b) <= c || (a + c) <= b || (b + c) <= a)
		return "Not triangle";
	if (a != b && b != c && a != c)
		return "Scalene";
	if (a == b && b == c && a == c)
		return "Equilateral";
	if (a == b || b == c || a == c)
		return "Isosceles";
	return "Unknown type";
}