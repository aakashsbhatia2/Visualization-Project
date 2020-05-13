import operator

from flask import Flask, render_template, request, redirect, Response, jsonify
import pandas as pd
import json
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MinMaxScaler
from statistics import mode
from collections import Counter

df_strat_final = None
set_of_states = set()
mapdata = {}
statedata = []

us_state_abbrev = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'American Samoa': 'AS',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Guam': 'GU',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Northern Mariana Islands':'MP',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virgin Islands': 'VI',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
}

us_state_fullform = {'AL': 'Alabama',
                     'AK': 'Alaska',
                     'AS': 'American Samoa',
                     'AZ': 'Arizona',
                     'AR': 'Arkansas',
                     'CA': 'California',
                     'CO': 'Colorado',
                     'CT': 'Connecticut',
                     'DE': 'Delaware',
                     'DC': 'District of Columbia',
                     'FL': 'Florida',
                     'GA': 'Georgia',
                     'GU': 'Guam',
                     'HI': 'Hawaii',
                     'ID': 'Idaho',
                     'IL': 'Illinois',
                     'IN': 'Indiana',
                     'IA': 'Iowa',
                     'KS': 'Kansas',
                     'KY': 'Kentucky',
                     'LA': 'Louisiana',
                     'ME': 'Maine',
                     'MD': 'Maryland',
                     'MA': 'Massachusetts',
                     'MI': 'Michigan',
                     'MN': 'Minnesota',
                     'MS': 'Mississippi',
                     'MO': 'Missouri',
                     'MT': 'Montana',
                     'NE': 'Nebraska',
                     'NV': 'Nevada',
                     'NH': 'New Hampshire',
                     'NJ': 'New Jersey',
                     'NM': 'New Mexico',
                     'NY': 'New York',
                     'NC': 'North Carolina',
                     'ND': 'North Dakota',
                     'MP': 'Northern Mariana Islands',
                     'OH': 'Ohio',
                     'OK': 'Oklahoma',
                     'OR': 'Oregon',
                     'PA': 'Pennsylvania',
                     'PR': 'Puerto Rico',
                     'RI': 'Rhode Island',
                     'SC': 'South Carolina',
                     'SD': 'South Dakota',
                     'TN': 'Tennessee',
                     'TX': 'Texas',
                     'UT': 'Utah',
                     'VT': 'Vermont',
                     'VI': 'Virgin Islands',
                     'VA': 'Virginia',
                     'WA': 'Washington',
                     'WV': 'West Virginia',
                     'WI': 'Wisconsin',
                     'WY': 'Wyoming'}


app = Flask(__name__)

@app.route("/", methods = ['GET', 'POST'])
def index():
    global data
    return render_template("index.html", data = data)

def prep_map_data():
    global mapdata, df

    us_states = pd.read_json("templates/us-states.json")

    featurerecords = us_states[["features"]].to_dict(orient="records")
    maparr = []

    for state in featurerecords:
        maparr.append(state['features'])

    mapdata['features'] = maparr

def prep_state_data():
    global df
    csvdata = df.to_dict(orient="records")
    accidentsdata = {}
    for row in csvdata:
        key = us_state_fullform[row['State']]
        if key in accidentsdata:
            accidentsdata[key] += 1
        else:
            accidentsdata[key] = 1

    for state in accidentsdata:
        record = {}
        record['state'] = state
        record['value'] = accidentsdata[state]
        statedata.append(record)

@app.route("/getusmapdata", methods = ['GET', 'POST'])
def get_map_data():
    if request.method == 'POST':
        chart_data = json.dumps(mapdata, indent=2)
        data = {'chart_data': chart_data}
        return jsonify(data)
    return render_template("index.html")

@app.route("/getstatesdata", methods = ['GET', 'POST'])
def get_states_statistics():
    global statedata
    if request.method == 'POST':
        chart_data = json.dumps(statedata, indent=2)
        data = {'chart_data': chart_data}
        return jsonify(data)
    return render_template("index.html")

def stratified_samples(df):
    global df_strat_final
    x = df.loc[:, :'Weather_Condition_Encoded']
    kmeans = KMeans(n_clusters = 4).fit(x)
    kmeans.fit(x)
    y_hat = kmeans.predict(x)
    df['Cluster'] = y_hat
    df_c0 = df.loc[df['Cluster'] == 0]
    df_c0_sample = df_c0.sample(frac=0.25)

    df_c1 = df.loc[df['Cluster'] == 1]
    df_c1_sample = df_c1.sample(frac=0.25)

    df_c2 = df.loc[df['Cluster'] == 2]
    df_c2_sample = df_c2.sample(frac=0.25)

    df_c3 = df.loc[df['Cluster'] == 3]
    df_c3_sample = df_c3.sample(frac=0.25)

    df_strat_samples = df_c0_sample.append(df_c1_sample.append(df_c2_sample.append(df_c3_sample)))
    df_strat_final = df_strat_samples.drop(columns='Cluster')

    mapping = df_strat_final.to_dict(orient="records")
    chart_data = json.dumps(mapping, indent=2)
    data = {'chart_data': chart_data}
    return data

@app.route("/getoverviewdata", methods = ['GET', 'POST'])
def getOverviewStats():
    global overviewdf
    if request.method == 'POST':
        mapping = overviewdf.to_dict(orient="records")
        chart_data = json.dumps(mapping, indent=2)
        data = {'chart_data': chart_data}
        return jsonify(data)
    return render_template("index.html")


def prepareOverviewStats():
    global df_strat_final, set_of_states
    columns = ['State', 'Num_Accidents', 'Severity', 'Temperature_F', 'Humidity_per', 'Pressure_in',
               'Visibility_mi', 'Wind_Speed_mph', 'Precipitation_in']
    df = pd.DataFrame(columns=columns)
    list_temp = list(list())
    for state in set_of_states:
        df_comp = df_strat_final.loc[df_strat_final['State'] == state]
        list_comp = df_comp.values.tolist()
        l = len(list_comp)
        severities = list()
        for i in range(l):
            severities.append(int(list_comp[i][0]))
        if(len(severities) > 0):
            severities = sorted(dict(Counter(severities)).items(), key=operator.itemgetter(1),reverse=True)
            max_value = severities[0][1]
            final_severity = severities[0][0]
            for severity in severities:
                if severity[1] == max_value and severity[0] > final_severity:
                    final_severity = severity[0]
            temperatures = list()
            humidities = list()
            pressures = list()
            visibilities = list()
            wind_speeds = list()
            precipitations = list()
            for i in range(l):
                severity = int(list_comp[i][0])
                if severity == final_severity:
                    temperatures.append(list_comp[i][3])
                    humidities.append(list_comp[i][4])
                    pressures.append(list_comp[i][5])
                    visibilities.append(list_comp[i][6])
                    wind_speeds.append(list_comp[i][7])
                    precipitations.append(list_comp[i][8])
            final_temperature = sum(temperatures) / max_value
            final_humidity = sum(humidities) / max_value
            final_pressure = sum(pressures) / max_value
            final_visibility = sum(visibilities) / max_value
            final_windspeed = sum(wind_speeds) / max_value
            final_precipitation = sum(precipitations) / max_value
            temp_list = list()
            temp_list.append(state)
            temp_list.append(l)
            temp_list.append(final_severity)
            temp_list.append(final_temperature)
            temp_list.append(final_humidity)
            temp_list.append(final_pressure)
            temp_list.append(final_visibility)
            temp_list.append(final_windspeed)
            temp_list.append(final_precipitation)
            list_temp.append(temp_list)

    df = pd.DataFrame(list_temp, columns=columns)
    # df.append(df_temp)

    columns.append('PC1')
    columns.append('PC2')
    df_final = pd.DataFrame(columns=columns)
    pca = PCA(n_components=2)
    for state in set_of_states:
        list_temp = df.values.tolist()
        x = MinMaxScaler().fit_transform(df.loc[:, 'Num_Accidents':'Precipitation_in'])
        principalComponents = pca.fit_transform(x)
        for i in range(len(principalComponents)):
            list_temp[i].append(principalComponents[i][0])
            list_temp[i].append(principalComponents[i][1])
        df_temp2 = pd.DataFrame(list_temp, columns=columns)
        df_final = df_final.append(df_temp2)

    return df_final

def get_pc_values():
    df = pd.read_csv("data_final_sampled.csv")

    states = df['State'].tolist()
    columns = df.columns.tolist()
    columns.append('PC1')
    columns.append('PC2')
    df_final = pd.DataFrame(columns=columns)

    for state in states:
        set_of_states.add(state)

    pca = PCA(n_components=2)
    for state in set_of_states:
        df_temp = df.loc[df['State'] == state]
        list_temp = df_temp.values.tolist()
        x = MinMaxScaler().fit_transform(df_temp.loc[:, :'Weather_Condition_Encoded'])
        principalComponents = pca.fit_transform(x)
        for i in range(len(principalComponents)):
            list_temp[i].append(principalComponents[i][0])
            list_temp[i].append(principalComponents[i][1])
        df_temp2 = pd.DataFrame(list_temp, columns=columns)
        df_final = df_final.append(df_temp2)

    return df_final


if __name__ == "__main__":
    df = get_pc_values()
    data = stratified_samples(df)
    overviewdf = prepareOverviewStats()
    prep_map_data()
    prep_state_data()
    app.run(debug=True)