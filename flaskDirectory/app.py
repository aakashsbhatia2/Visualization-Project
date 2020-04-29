from flask import Flask, render_template, request, redirect, Response, jsonify
import pandas as pd
import json
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans


app = Flask(__name__)

@app.route("/", methods = ['GET', 'POST'])
def index():
    global df
    data = stratified_samples(df)
    return render_template("index.html", data = data)
    # return render_template("index.html")

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
def get_states_lived():
    global df
    stateslived = pd.read_csv("templates/statesdata.csv")
    stateslived = stateslived.set_index("state", drop=False)
    stateslived = stateslived.to_dict(orient = "records")

    statedata = []

    for state in stateslived:
        record = {}
        record['state'] = state['state']
        record['value'] = state['value']
        statedata.append(record)

    print(stateslived[0]['state'])
    if request.method == 'POST':
        chart_data = json.dumps(statedata, indent=2)
        data = {'chart_data': chart_data}
        return jsonify(data)
    return render_template("index.html")

@app.route("/getcitieslived", methods = ['GET', 'POST'])
def get_cities_lived():
    global df
    citieslived = pd.read_csv("templates/cities-lived.csv").to_dict(orient = "records")
    citydata = []

    for city in citieslived:
        record = {}
        record['lat'] = city['lat']
        record['lon'] = city['lon']
        record['place'] = city['place']
        record['years'] = city['years']
        citydata.append(record)

    if request.method == 'POST':
        chart_data = json.dumps(citydata, indent=2)
        data = {'chart_data': chart_data}
        return jsonify(data)
    return render_template("index.html")

"""@app.route("/stratified-samples", methods = ['POST'])
def get_elbow():
    
    return jsonify(2)"""
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


if __name__ == "__main__":
    df = pd.read_csv("data_final_sampled.csv")
    app.run(debug=True)