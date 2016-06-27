'use strict';

if (!app) { var app = {}; }
if (!MAX_ID) { var MAX_ID = 26; }
if (!MODULE) { var MODULE = {}; }

MODULE.Content = (function() {
    var data;

    var Content = function() {

    };

    Content.prototype.load = function(callback) {
        var xhr = new XMLHttpRequest();
        var self = this;
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                data = JSON.parse(this.response);
                return callback(data);
            }
        };
        xhr.open('GET','./data.json',true);
        xhr.send();
    };

    return Content;
}());

MODULE.ListScreen = (function() {

    var ListScreen = function(data) {
        this.screen = document.getElementById('list-screen');

        this.build(data);

        this.buttons = document.getElementsByClassName('list-subitem');

        for (var i = 0; i < this.buttons.length; i++){
            this.buttons[i].onclick = this.play.bind(this,this.buttons[i].id);
        }
    };

    ListScreen.prototype.build = function(data) {
        //TODO: Refactor. Code is clean and simple, but hard to read
        var item, subitem;
        var outterul = document.createElement('ul');
        for (var i in data) {
            item = document.createElement('li');
            item.className = 'list-item';
            var innerp = document.createElement('p');
            innerp.innerHTML = data[i].label;
            item.appendChild(innerp);
            var innerul = document.createElement('ul');
            for (var j in data[i].sound) {
                subitem = document.createElement('li');
                subitem.className = 'list-subitem';
                subitem.id = data[i].sound[j].id;
                subitem.innerHTML = data[i].sound[j].text;
                innerul.appendChild(subitem);
            }
            item.appendChild(innerul);
            outterul.appendChild(item);
        }
        this.screen.appendChild(outterul);
    };

    ListScreen.prototype.play = function(id) {
        document.getElementById(id).classList.add('playing');
        app.sound.play(id);
        setTimeout(function(){
            document.getElementById(id).classList.remove('playing');
        },500);
    };

    ListScreen.prototype.display = function() {
        this.screen.style.display = 'block';
    };

    ListScreen.prototype.hide = function() {
        this.screen.style.display = 'none';
    };

    ListScreen.prototype.onBack = function() {
        app.screen.display('title');
    };

    return ListScreen;
}());

MODULE.SoundCordova = (function() {

    var SoundCordova = function() {
        //TODO: load array from json
        this.soundArray = {};

        for (var i = 0; i <= MAX_ID; i++){
            this.soundArray[i] = new Media('/android_asset/www/audio/'+i+'.mp3',this.onSuccess,this.onError);
        }

        this.current = null;
    };

    SoundCordova.prototype.onSuccess = function() {
        this.current = null;
    }

    SoundCordova.prototype.onError = function(e) {
        this.current = null;
        console.log('Error playing sound: '+JSON.stringify(e,null,4));
    }

    SoundCordova.prototype.play = function(id) {
        this.soundArray[id].play();
        this.current = id;
    };

    SoundCordova.prototype.pause = function() {
        if (this.current === null) {
            return;
        }

        this.soundArray[this.current].pause();
    }

    SoundCordova.prototype.stop = function() {
        if (this.current === null) {
            return;
        }

        this.soundArray[this.current].stop();
        this.current = null
    }

    return SoundCordova;

}());

MODULE.SoundWeb = (function() {

    var SoundWeb = function() {
        //TODO: load array from json
        console.log(app.content.data);
        this.soundArray = {};

        for (var i = 0; i <= MAX_ID; i++){
            this.soundArray[i] = new Audio('audio/'+i+'.mp3',this.onSuccess,this.onError);
        }

        this.current = null;
    };

    SoundWeb.prototype.onSuccess = function() {
        this.current = null;
    }

    SoundWeb.prototype.onError = function(e) {
        this.current = null;
        console.log('Error playing sound: '+JSON.stringify(e,null,4));
    }

    SoundWeb.prototype.play = function(id) {
        this.soundArray[id].play();
        this.current = id;
    };

    SoundWeb.prototype.pause = function() {
        if (this.current === null) {
            return;
        }

        this.soundArray[this.current].pause();
    }

    SoundWeb.prototype.stop = function() {
        if (this.current === null) {
            return;
        }

        this.soundArray[this.current].pause();
        this.soundArray[this.current].currentTime = 0;
        this.current = null;
    }

    return SoundWeb;

}());

MODULE.Sound = (function() {

    var Sound = function() {
        if ('Media' in window) {
            this.player = new MODULE.SoundCordova();
        } else {
            this.player = new MODULE.SoundWeb();
        }
    };

    Sound.prototype.play = function(id) {
        this.player.stop();
        this.player.play(id);
    };

    Sound.prototype.pause = function() {
        this.player.pause();
    };

    Sound.prototype.stop = function() {
        this.player.stop();
    };

    return Sound;
    
}());


MODULE.Screen = (function() {
    var screens;

    var Screen = function(new_screens) {
        screens = new_screens;
        this.current = null;
    };

    Screen.prototype.display = function(screen, params) {
        if (!screens[screen]) {
            return console.error("Invalid Screen", screen);
        }

        if (this.current) {
          screens[this.current].hide();
        }

        this.current = screen;

        screens[screen].display(params);
    };

    Screen.prototype.onBack = function() {
        var current_screen = screens[this.current];
        if (this.current && "onBack" in current_screen) {
            current_screen.onBack();
        }
    };

    return Screen;

}());

MODULE.SoundTest = (function() {
    var SoundTest = function() {
        this.screen = document.getElementById('soundtest-screen');
        this.counter = document.getElementById('counter');
        this.buttons = {
            previous : document.getElementById('btn-previous'),
            next : document.getElementById('btn-next'),
            play : document.getElementById('btn-play')
        };

        this.screenshot = document.getElementById('screenshot');
        this.screenshot.src = 'img/poops/0.jpg';
        this.screenshot.onclick = this.play.bind(this);

        this.buttons.previous.onclick = this.refreshCounter.bind(this,-1);
        this.buttons.next.onclick = this.refreshCounter.bind(this,1);
        this.buttons.play.onclick = this.play.bind(this);
    };

    SoundTest.prototype.display = function () {
        this.screen.style.display = 'block';
    };

    SoundTest.prototype.hide = function() {
        this.screen.style.display = 'none';
    };

    SoundTest.prototype.onBack = function() {
        app.screen.display('title');
    };

    SoundTest.prototype.refreshCounter = function(param) {
        app.sound.stop();
        app.current_id += param;

        if (app.current_id > MAX_ID) app.current_id = 0;
        if (app.current_id < 0) app.current_id = MAX_ID;

        if (app.current_id < 10) this.counter.innerHTML = '0'+app.current_id;
        else this.counter.innerHTML = app.current_id;
        
        this.screenshot.src = 'img/poops/'+app.current_id+'.jpg';        
    };

    SoundTest.prototype.play = function() {
        app.sound.play(app.current_id);
    };

    SoundTest.prototype.pause = function() {
        app.sound.pause();
    };

    SoundTest.prototype.stop = function() {
        app.sound.stop();
    };

    return SoundTest;

}());

MODULE.TitleScreen = (function() {
    var TitleScreen = function() {
        this.screen = document.getElementById('title-screen');
        this.menu = document.getElementsByClassName('menu-item');
        this.buttons = {
            soundtest : this.menu[0],
            list : this.menu[1],
            random : this.menu[2]            
        }

        this.buttons.soundtest.onclick = this.onSoundTest.bind(this);
        this.buttons.list.onclick = this.onList.bind(this);
        this.buttons.random.onclick = this.onRandom.bind(this);
    };

    TitleScreen.prototype.display = function () {
        this.screen.style.display = 'block';
    };

    TitleScreen.prototype.hide = function() {
        this.screen.style.display = 'none';
    };

    TitleScreen.prototype.onSoundTest = function() {
        app.sound.stop();
        app.screen.display('soundtest');
    };

    TitleScreen.prototype.onList = function() {
        app.sound.stop();
        app.screen.display('list');
    };

    TitleScreen.prototype.onRandom = function() {
        app.sound.stop();
        app.sound.play(Math.round(Math.random()*MAX_ID));
    };

    return TitleScreen;

}());

(function() {
    if ('cordova' in window) {
        console.log("Cordova App");
        document.addEventListener("deviceready", init, false);
    } else {
        console.log("Web App");
        init();
    }

    function init() {
        FastClick.attach(document.body);

        app = {
            content : new MODULE.Content(),
            current_id : 0,
            sound : null,
            screenshot : document.getElementById('screenshot')
        };

        app.content.load(function(data){
            if (!data) {
                console.log('empty');
                return;
            }

            app.content.data = data;

            app.sound = new MODULE.Sound();

            app.screen = new MODULE.Screen({
                title : new MODULE.TitleScreen(),
                soundtest : new MODULE.SoundTest(),
                list : new MODULE.ListScreen(data)
            });

            document.addEventListener("backbutton", function(){ app.screen.onBack(); app.sound.stop(); }, false);
            document.addEventListener("pause", function(){ app.sound.stop(); } , false);

            app.screen.display('title');

        });    


        //console.log(app); 
        console.log('Ready');
    }

})();