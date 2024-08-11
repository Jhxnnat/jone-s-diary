from flask import Flask, redirect, url_for, render_template, request, session, flash
from functools import wraps
import os
from dotenv import load_dotenv
import pyrebase
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired
from datetime import datetime

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
    'databaseURL': 'https://jone-s-diary-default-rtdb.firebaseio.com/'
}

firebase = pyrebase.initialize_app(firebaseConfig)
auth = firebase.auth()
db = firebase.database()

app.secret_key = os.getenv('APP_SECRET')

# Decorator to check if user is authenticated
def auth_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'user' in session:
            return func(*args, **kwargs)
        else:
            return redirect('/login')
    return wrapper

### Public Routes ###
@app.route('/')
def index():
    return redirect('/signup') 

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

            #set the initial (dafault) data to the new user
            auth.update_profile(user['idToken'], display_name=username)
            date = datetime.today().strftime('%Y-%m-%d')
            data = {
                "entries":{
                    'firstKey': {
                        'content': 'First entry',
                        'date': date,
                        'datelast': 'Last modified: no modified date yet', 
                        'index': '0', 
                        'name': 'First'
                        }
                }}
            
            db.child("users").child(email.replace(".", "")).set(data)

            session['user'] = username
            session['email'] = email
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
            session['email'] = email
            return redirect('/home')
        except:
            flash("Failed to login, please check your credentials")
    return render_template('./login/login.html')

@app.route('/legacy', methods=['GET', 'POST'])
def legacy():
    return render_template('legacy.html')

### Protected Routes ###
@app.route('/logout')
@auth_required
def logout():
    session.pop('user')
    if 'email' in session:
        session.pop('email')
    return redirect('/login')

@app.route('/home')
@auth_required
def home(): 
    return render_template('home.html')

@app.route('/entries')
@auth_required
def entries():
    name = session['user']
    email = session['email']
    dbentries = db.child("users").child(email.replace(".", "")).child("entries").get().val()
    #print("Entries: ", dbentries)
    return render_template('entries.html', user_name=name, entries=dbentries)

@app.route('/editentry/<index>')
@auth_required
def editentry(index):
    email = session['email'].replace(".", "")
    entry_tittle = db.child("users").child(email).child("entries").child(index).child("name").get().val()
    entry_text = db.child("users").child(email).child("entries").child(index).child("content").get().val()
    return render_template('editor.html', index=index, entry_tittle=entry_tittle, entry_text=entry_text)

@app.route('/saveentry', methods=['GET','POST'])
@auth_required
def saveentry():
    if request.method == 'POST':
        index = request.form['entry-index']
        print("Entry to save: ", index)
        tittle = request.form['entry-tittle']
        text = request.form['entry-text']
        email = session['email'].replace(".", "")
        date = datetime.today().strftime('%Y-%m-%d')
        data = {
            'content': text,
            'date': date,
            'datelast': 'Last modified: ' + date, 
            'index': "deprecated", 
            'name': tittle
        }
        db.child("users").child(email).child("entries").child(index).update(data)
    return redirect('/editentry/' + index)

@app.route('/newentry')
@auth_required
def newentry():
    email = session['email']
    dbentries = db.child("users").child(email.replace(".", "")).child("entries").get().val()
    dbentries_len = len(dbentries)
    date = datetime.today().strftime('%Y-%m-%d')
    data = {
        'content': 'New entry',
        'date': date,
        'datelast': 'Last modified: no modified date yet', 
        'index': str(dbentries_len), 
        'name': 'New'}
    db.child("users").child(email.replace(".", "")).child("entries").push(data)
    print("New entry added")
    return redirect('/entries')

@app.route('/deleteentryconfirm', methods=['GET','POST'])
@auth_required
def deleteentryconfirm():
    if request.method == 'POST':
        entry_key = request.form['entry-key']
        name = request.form['entry-name']
        print("Entry to delete: ", entry_key)
    return render_template('deleteentry.html', key=entry_key, name=name)

@app.route('/deleteentry', methods=['GET','POST'])
@auth_required
def deleteentry():
    if request.method == 'POST':
        email = session['email'].replace(".", "")
        key = request.form['entry-key']
        entry = db.child("users").child(email).child("entries").get().val()
        length = len(entry)
        print("Length: ", length)
        if length == 1: #If there is only one entry, we can't delete it, so we just update it
            data = {
                'content': 'Unnamed entry',
                'date': datetime.today().strftime('%Y-%m-%d'),
                'datelast': 'Last modified: no modified date yet', 
                'index': '0', 
                'name': 'Unnamed'
            }
            db.child("users").child(email).child("entries").child("firstKey").update(data)
        else:
            db.child("users").child(email).child("entries").child(key).remove()

    return redirect('/entries')

### Invalid URLS ###
@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(error):
    return render_template('500.html'), 500


