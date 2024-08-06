from flask import Flask, redirect, url_for, render_template, request, session, flash
import os
from dotenv import load_dotenv
import pyrebase
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired

load_dotenv()

app = Flask(__name__)

firebaseConfig = {
    'apiKey': "AIzaSyBdpTfAJTOrUbHsBNGkFPTE618fSY4ORiU",
    'authDomain': "jone-s-diary.firebaseapp.com",
    'projectId': "jone-s-diary",
    'storageBucket': "jone-s-diary.appspot.com",
    'messagingSenderId': "829937216313",
    'appId': "1:829937216313:web:a82c58e5422933069e56e8",
    'measurementId': "G-KB0RQRVF0C",
    'databaseURL': ''
}

firebase = pyrebase.initialize_app(firebaseConfig)
auth = firebase.auth()

app.secret_key = os.getenv('APP_SECRET')

@app.route('/')
def index():
    return redirect('/signup') 

@app.route('/home')
def home(): 
    return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if('user' in session):
        return redirect('/home')
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        print(username, email, password)
        try:
            user = auth.create_user_with_email_and_password(email, password)
            auth.update_profile(user['idToken'], display_name=username)
            session['user'] = username #TODO: do not use session to store user data, instead use flask_login
            print("before account info")
            print(auth.get_account_info(user['idToken']))
            return redirect('/home')
        except Exception as e:
            print(e)
            flash("Failed to Sing up, please check your credentials")
    return render_template('./login/signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        try:
            user = auth.sign_in_with_email_and_password(email, password)
            session['user'] = auth.get_account_info(user['idToken'])['users'][0]['displayName']
            return redirect('/home')
        except:
            flash("Failed to login, please check your credentials")
    return render_template('./login/login.html')

@app.route('/logout')
def logout():
    try :
        session.pop('user')
    except:
        pass
    return redirect('/login')

@app.route('/write/<name>')
def write(name):
    return render_template('editor.html', user_name=name)


### Invalid URLS ###
@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run(debug=True)
