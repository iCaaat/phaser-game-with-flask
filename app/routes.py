from flask import Blueprint, request, jsonify, render_template, redirect, url_for
from .models import Player, Score
from . import db

bp = Blueprint('routes', __name__)

# 主页面 - 显示玩家信息和历史得分
@bp.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        username = request.form['username']
        if(request.form['email']):
            email = request.form['email']
        else:
            email = ''
        # 检查数据库中是否有玩家记录
        player = Player.query.filter_by(username=username).first()
        if not player:
            # 如果玩家不存在，添加到数据库
            player = Player(username=username, email=email)
            db.session.add(player)
            db.session.commit()
        # 读取玩家历史得分
        scores = Score.query.filter_by(player_id=player.id).all()
        return render_template('game.html', player=player, scores=scores)
    return render_template('index.html')

# 游戏分数提交接口
@bp.route('/submit_score', methods=['POST'])
def submit_score():
    try:
      # 获取前端传来的数据
      data = request.json
      username = data.get('username')
      email = data.get('email')
      score_value = data.get('score')
      if not username or not score_value:
        return jsonify({'error': 'Missing username or score'}), 400
      
      # 查找玩家
      player = Player.query.filter_by(username=username).first()
      if not player:
        return jsonify({'error': 'Player not found'}), 404
      
      # 保存分数
      score = Score(player_id=player.id, score=score_value)
      db.session.add(score)
      db.session.commit()

      return jsonify({'message': 'Score submitted successfully'}), 201
    
    except Exception as e:
      # 返回异常信息，便于调试
      return jsonify({'error': str(e)}), 500
