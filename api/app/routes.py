from flask import render_template, flash, redirect, url_for, request, g, jsonify
from flask_login import current_user, login_user, logout_user, login_required
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from app import app, db
from app.models import User, Post
from werkzeug.urls import url_parse
from datetime import datetime,timedelta, timezone
import json

@app.before_request
def before_request():
    if current_user.is_authenticated:
        current_user.last_seen = datetime.utcnow()
        db.session.commit()

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

@app.route('/api/token', methods=["POST"])
def create_token():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        return {"msg": "Wrong email or password"}, 401
    access_token = create_access_token(identity=username)
    response = {"access_token":access_token}
    return response

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


@app.route('/api/home', methods=["POST", "GET"])
@jwt_required()
def index():
    user = User.query.filter_by(username=get_jwt_identity()).first_or_404()
    page = request.args.get('page', 1, type=int)
    posts = user.followed_posts().paginate(
        page, app.config['POSTS_PER_PAGE'], False)
    ret = [{'username':post.author.username, 'body':post.body, 'timestamp':post.timestamp.replace(tzinfo=timezone.utc).timestamp(), 'id':post.id} for post in posts.items]
    return jsonify(ret)

@app.route('/api/explore', methods=["POST", "GET"])
@jwt_required()
def explore():
    page = request.args.get('page', 1, type=int)
    posts = Post.query.order_by(Post.timestamp.desc()).paginate(
        page, app.config['POSTS_PER_PAGE'], False)
    ret = [{'username':post.author.username, 'body':post.body, 'timestamp':post.timestamp.replace(tzinfo=timezone.utc).timestamp() , 'id':post.id}  for post in posts.items]
    return jsonify(ret)

@app.route('/api/submitPost', methods=["POST"])
@jwt_required()
def submitPost():
    text = request.json.get("text", None)
    user = User.query.filter_by(username=get_jwt_identity()).first_or_404()
    post = Post(body=text, author=user)
    db.session.add(post)
    db.session.commit()
    response = jsonify({"msg": "submission successful", 'time':datetime.utcnow().replace(tzinfo=timezone.utc).timestamp()})
    return response

@app.route('/api/register', methods=['GET', 'POST'])
def register():
    username = request.json.get("username", None)
    email    = request.json.get("email", None)
    password = request.json.get("password", None)
    ret = []
    if User.query.filter_by(username=username).first() is not None: ret.append({'err':'Username already exists.'})
    if User.query.filter_by(email=email).first() is not None: ret.append({'err':'Email Address already exists.'})
    if len(ret): return jsonify(ret)
    user = User(username=username, email=email)
    user.set_password(password=password)
    db.session.add(user)
    db.session.commit()
    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        return {"msg": "Wrong email or password"}, 401
    access_token = create_access_token(identity=username)
    response = {"access_token":access_token}
    return response

@app.route('/api/user/<username>' , methods=["POST", "GET"])
@jwt_required()
def user(username):
    #first_or_404:基本的にfirstと同じだが、ユーザーが見つからないと404を返す
    user = User.query.filter_by(username=username).first_or_404()
    page = request.args.get('page', 1, type=int)
    posts = user.posts.order_by(Post.timestamp.desc()).paginate(
        page, app.config['POSTS_PER_PAGE'], False)
    ret = [{'username':post.author.username, 'body':post.body, 'timestamp':post.timestamp.replace(tzinfo=timezone.utc).timestamp(), 'id':post.id} for post in posts.items]
    return jsonify(ret)

@app.route('/api/isFollowing/<username>' , methods=["POST", "GET"])
@jwt_required()
def isFollowing(username):
    currentUser = User.query.filter_by(username=get_jwt_identity()).first_or_404()
    user = User.query.filter_by(username=username).first_or_404()
    res = 1 if currentUser.is_following(user) else 0
    return jsonify({'isFollowing':res})

@app.route('/api/follow/<username>' , methods=["POST", "GET"])
@jwt_required()
def Follow(username):
    currentUser = User.query.filter_by(username=get_jwt_identity()).first_or_404()
    user = User.query.filter_by(username=username).first_or_404()
    currentUser.follow(user)
    db.session.commit()
    return jsonify({'msg':'success'})

@app.route('/api/unfollow/<username>' , methods=["POST", "GET"])
@jwt_required()
def Unollow(username):
    currentUser = User.query.filter_by(username=get_jwt_identity()).first_or_404()
    user = User.query.filter_by(username=username).first_or_404()
    currentUser.unfollow(user)
    db.session.commit()
    return jsonify({'msg':'success'})

@app.route('/api/delete/<postID>' , methods=["POST", "GET"])
@jwt_required()
def delete_Post(postID):
    currentUser = User.query.filter_by(username=get_jwt_identity()).first_or_404()
    post = Post.query.filter_by(id=postID).first_or_404()
    if currentUser.id != post.user_id:
        return jsonify({'msg':'invalid user'})
    db.session.delete(post)
    db.session.commit()
    return jsonify({'msg':'success'})

@app.route('/api/edit/<postID>' , methods=["POST", "GET"])
@jwt_required()
def editPost(postID):
    currentUser = User.query.filter_by(username=get_jwt_identity()).first_or_404()
    post = Post.query.filter_by(id=postID).first_or_404()
    if currentUser.id != post.user_id:
        return jsonify({'msg':'invalid user'})
    post.body = request.json.get("text", None)
    db.session.commit()
    return jsonify({'msg':'success'})

@app.route('/api/search', methods=["POST", "GET"])
@jwt_required()
def search():
    page = request.args.get('page', 1, type=int)
    posts, total_p = Post.search(request.json.get('text', None), page, app.config['POSTS_PER_PAGE'])
    if posts==None:
        return jsonify([])
    ret = [{'username':post.author.username, 'body':post.body, 'timestamp':post.timestamp.replace(tzinfo=timezone.utc).timestamp(), 'id':post.id} for post in posts.items]
    return jsonify(ret)


'''
@app.route('/edit_profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    form = EditProfileForm(current_user.username)
    if form.validate_on_submit():
        current_user.username = form.username.data
        current_user.about_me = form.about_me.data
        db.session.commit()
        flash('Your changes have been saved.')
        return redirect(url_for('edit_profile'))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.about_me.data = current_user.about_me
    return render_template('edit_profile.html', title='Edit Profile',
                           form=form)


@app.route('/search')
@login_required
def search():
    if not g.search_form.validate():
        return redirect(url_for('explore'))
    page = request.args.get('page', 1, type=int)
    posts, total_p = Post.search(g.search_form.q.data, page, app.config['POSTS_PER_PAGE'])
    users, total_u = User.search(g.search_form.q.data, page, app.config['POSTS_PER_PAGE'])
    next_url = url_for('search', q=g.search_form.q.data, page=page + 1) \
        if total_p > page * app.config['POSTS_PER_PAGE'] else None
    prev_url = url_for('search', q=g.search_form.q.data, page=page - 1) \
        if page > 1 else None
    return render_template('search.html', title='Search', posts=posts, next_url=next_url, prev_url=prev_url)
    '''