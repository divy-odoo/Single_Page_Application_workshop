# -*- coding: utf-8 -*-
from odoo import http
import json
from odoo.modules.module import get_module_resource

class MusicPlayer(http.Controller):
     @http.route('/music', auth='public')
     def index(self, **kw):
        return http.request.render('music_player.music_template')

     @http.route('/music/search', auth='public')
     def list(self, **kw):

         song_name = kw.get('song_name')

         musics = http.request.env["music_player.music_player"].search_read([('name','ilike',song_name)],fields={"name","url"})
         if not musics:
             musics = "Song not Found"

         return http.Response(json.dumps({'result':musics}),content_type="application/json")

     @http.route('/music/<model("music_player.music_player"):music>', type='http', auth="public", methods=["GET"])
     def load(self, music, **kw):
         music_file_path = get_module_resource('music_player', 'static/songs', music.filename)
         file = open(music_file_path, 'rb').read()
         return file
