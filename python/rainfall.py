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
all_files = glob.glob('../data/*.csv')
li = []
df_from_each_file = (pd.read_csv(f, usecols=['Rainfall','Year','Month','ISO3']) for f in all_files)
df = pd.concat(df_from_each_file, ignore_index=True)

# Define variables.
# https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
countries = ['AFG','ALB','DZA','AND','AGO','ATG','ARG','ARM','AUS','AUT','AZE','BHS','BHR','BGD','BRB','BLR','BEL','BLZ','BEN','BTN','BOL','BIH','BWA','BRA','BRN','BGR','BFA','BDI','KHM','CMR','CAN','CPV','CAF','TCD','CHL','CHN','COL','COM','COD','COG','CRI','CIV','HRV','CUB','CYP','CZE','DNK','DJI','DMA','DOM','ECU','EGY','SLV','GNQ','ERI','EST','ETH','FRO','FSM','FJI','FIN','FRA','GAB','GMB','GEO','DEU','GHA','GRC','GRL','GRD','GTM','GIN','GNB','GUY','HTI','HND','HUN','ISL','IND','IDN','IRN','IRQ','IRL','ISR','ITA','JAM','JPN','JOR','KAZ','KEN','KIR','PRK','KOR','KWT','KGZ','LAO','LVA','LBN','LSO','LBR','LBY','LIE','LTU','LUX','MKD','MDG','MWI','MYS','MDV','MLI','MLT','MHL','MRT','MUS','MEX','MDA','MCO','MNG','MAR','MOZ','MMR','NAM','NPL','NLD','NCL','NZL','NIC','NER','NGA','MNP','NOR','OMN','PAK','PLW','PAN','PNG','PRY','PER','PHL','POL','PRT','PRI','QAT','MNE','SRB','ROU','RUS','RWA','WSM','STP','SAU','SEN','SYC','SLE','SGP','SVK','SVN','SLB','SOM','ZAF','SSD','ESP','LKA','KNA','LCA','VCT','SDN','SUR','SWZ','SWE','CHE','SYR','TJK','TZA','THA','TLS','TGO','TON','TTO','TUN','TUR','TKM','TUV','UGA','UKR','ARE','GBR','USA','URY','UZB','VUT','VEN','VNM','YEM','ZMB','ZWE']
# countries = ['AFG','ALB']
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

# Let's calculate the monthly averages per country.
averages = {}
compare_year_start = 1981
compare_year_end = 2010
for country in countries:
  averages[country] = {}
  for month in months:
    averages[country][month] = df.loc[(df['ISO3'] == country) & (df['Month'] == month) & (df['Year'] >= compare_year_start) & (df['Year'] <= compare_year_end)]['Rainfall'].mean()

# Define a function that calculates the difference between given numbers.
def distance(a, b): 
  return (max(a, b) - min(a, b)) * (-1 if a > b else 1)

# Let's calculate the anomalities per country and per month.
data = {}
year_start = 1901
year_end = 2016
for year in range(year_start, (year_end + 1), 1):
  data[year] = []
  print('Analysing year: ' + str(year))
  for country in countries:
    month_data = []
    for month in months:
        month_data.append({
          'month':month,
          'value':round(distance(averages[country][month], df.loc[(df['ISO3'] == country) & (df['Year'] == year) & (df['Month'] == month)]['Rainfall'].values[0]), 1)
        })
    data[year].append({
      'country':country,
      'data':month_data
    })

# Export data to data.json.
import json
with open('../media/data/data.json', 'w') as outfile:
  json.dump(data, outfile)
