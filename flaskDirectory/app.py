from flask import Flask, render_template, request, redirect, Response, jsonify
import pandas as pd
import json
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MinMaxScaler


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

@app.route("/getusmapdata", methods = ['GET', 'POST'])
def get_map_data():
    global df

    us_states = pd.read_json("templates/us-states.json")

    featurerecords = us_states[["features"]].to_dict(orient="records")
    # print(featurerecords)
    maparr = []

    for state in featurerecords:
        # record = {}
        # record['feature'] = state
        # mapdata.append(record)
        maparr.append(state['features'])

    # print(record['feature']['features'])

    mapdata = {}
    mapdata['features'] = maparr

    print(mapdata['features'])
    if request.method == 'POST':
        chart_data = json.dumps(mapdata, indent=2)
        data = {'chart_data': chart_data}
        return jsonify(data)
    return render_template("index.html")

@app.route("/getstatesdata", methods = ['GET', 'POST'])
def get_states_statistics():
    global df
    csvdata = df.to_dict(orient = "records")
    accidentsdata = {}
    for row in csvdata:
        key = us_state_fullform[row['State']]
        if key in accidentsdata:
            accidentsdata[key] += 1
        else:
            accidentsdata[key] = 1

    statedata = []
    for state in accidentsdata:
        record = {}
        record['state'] = state
        record['value'] = accidentsdata[state]
        statedata.append(record)

    print(statedata)

    if request.method == 'POST':
        chart_data = json.dumps(statedata, indent=2)
        data = {'chart_data': chart_data}
        return jsonify(data)
    return render_template("index.html")

def stratified_samples(df):
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

def get_pc_values():
    df = pd.read_csv("data_final_sampled.csv")

    states = df['State'].tolist()
    columns = df.columns.tolist()
    columns.append('PC1')
    columns.append('PC2')
    df_final = pd.DataFrame(columns=columns)

    set_of_states = set()
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

    #df = pd.read_csv("data_final_sampled.csv")
    df = get_pc_values()
    data = stratified_samples(df)
    app.run(debug=True)