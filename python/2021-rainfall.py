#!/usr/bin/python
# -*- coding: UTF8 -*-
# @See http://www.python.org/dev/peps/pep-0263/

#######
# ABOUT
#######

# Rainfall analysis

########
# AUTHOR
########

# Teemo Tebest (teemo.tebest@gmail.com)

#########
# LICENSE
#########

# CC-BY-SA 4.0 EBU / Teemo Tebest

#######
# USAGE
#######

# python 2021-rainfall.py

# Load the Pandas libraries with alias pd.
import pandas as pd

# Import glob for reading files.
import glob

# Combine files.
# https://stackoverflow.com/questions/20906474/import-multiple-csv-files-into-pandas-and-concatenate-into-one-dataframe
all_files = glob.glob('../data/pr*.csv')
df_from_each_file = (pd.read_csv(f, sep=',', quotechar='"', header=0, skipinitialspace=True, names=['Rainfall', 'Year', 'Month', 'Country', 'ISO3']) for f in all_files)
df = pd.concat(df_from_each_file, ignore_index=True)

# Define variables.
# https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
countries = df.ISO3.unique().tolist()
del countries[countries.index('ARM')]
del countries[countries.index('BLZ')]
# countries = ['CAN','FRA','FIN','BRA','USA','ESP']
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

# Let's calculate the monthly averages per country.
averages = {}
compare_year_start = 1951
compare_year_end = 1980
for country in countries:
  print(country)
  averages[country] = {}
  for month in months:
    averages[country][month] = df.loc[(df['ISO3'] == country) & (df['Month'] == (month + ' Average')) & (df['Year'] >= compare_year_start) & (df['Year'] <= compare_year_end)]['Rainfall'].mean()

# Define a function that calculates the difference between given numbers.
def distance(a, b): 
  return (max(a, b) - min(a, b)) * (-1 if a > b else 1)

# Let's calculate the anomalities per country and per month.
data = {}
year_start = 1901
year_end = 2020
for year in range(year_start, (year_end + 1), 1):
  print(year)
  data[year] = []
  for country in countries:
    month_data = []
    for month in months:
      month_data.append({
        'month':month,
        'value':round(distance(averages[country][month], df.loc[(df['ISO3'] == country) & (df['Year'] == year) & (df['Month'] == (month + ' Average'))]['Rainfall'].values[0]), 1)
      })
    data[year].append({
      'country':country,
      'data':month_data
    })

# Export data to data.json.
import json
with open('../media/data/data.json', 'w') as outfile:
  json.dump(data, outfile)
