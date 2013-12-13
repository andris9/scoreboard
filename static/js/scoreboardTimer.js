// Copyright (c) 2013 Andris Reinman
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// AMD shim
/* jshint browser: true, nonstandard: true, strict: true */
/* global define: false, mimefuncs: false */
(function(root, factory) {

    "use strict";

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.scoreboardTimer = factory();
    }
}(this, function() {

    "use strict";

    function TimerObject(timer){
        this._pos = timer || 0;
        this._timer = 0;
        this._paused = true;
    }

    TimerObject.prototype.start = function(){
        if(!this._paused){
            return;
        }

        if(this._pos){
            this._timer = Date.now() - this._pos;    
        }else{
            this._timer = Date.now();
        }
        
        this._paused = false;
    };

    TimerObject.prototype.stop = function(){
        if(this._paused){
            return;
        }

        this._pos = Date.now() - this._timer;
        this._paused = true;
    };

    TimerObject.prototype.set = function(timer){
        if(this._paused){
            this._pos = timer;
        }else{
            this._timer = Date.now() - timer;
        }
    };

    TimerObject.prototype.get = function(){
        var timeDiff = this._paused ? this._pos : Date.now() - this._timer;
        return timeDiff;
    };

    function Counter(options){
        options = options || {};

        this._startTime = (options.startTime || 0) * 1000;
        this._endTime = (options.endTime || 0) * 1000;

        this._direction = options.direction || this._endTime - this._startTime || 1;
        this._direction = this._direction / Math.abs(this._direction);

        this._timer = new TimerObject(0);
        this._emitter = null;

        this._onUpdate = options.onUpdate;
        this._onStart = options.onStart;
        this._onStop = options.onStop;

        this._lastValue = false;
    }

    Counter.prototype.checkValues = function(){
        var value = this.get();

        if(value !== this._lastValue){
            this._lastValue = value;
            if(this._onUpdate){
                this._onUpdate(this._lastValue);
            }
        }

        if((this._direction > 0 && value >= this._endTime) || (this._direction < 0 && value <= this._endTime)){
            if(this._onStop){
                this._onStop();
            }
            this.stop();
        }
    };

    Counter.prototype.start = function(){
        var that = this;
        this._timer.start();

        this._emitter = setInterval(function(){
            that.checkValues();
        }, 10);
        
        if(this._onStart){
            this._onStart();
        }
        this.checkValues();
    };

    Counter.prototype.stop = function(){
        this._timer.stop();
        clearInterval(this._emitter);
    };

    Counter.prototype.get = function(){
        var diff = this._startTime + this._direction * this._timer.get(),
            response = Math[this._direction > 0 ? "floor" : "ceil"](diff/1000) * 1000;

        return response;
    };

    Counter.prototype.update = function(value){
        value = value * 1000;
        this._timer.set((value - this._startTime) * this._direction);

    }

    Counter.prototype.increment = function(value){
        value = value * 1000;
        var diff = this._startTime + this._direction * this._timer.get();
        this._timer.set(((diff + value * this._direction) - this._startTime) * this._direction);
    }

    function ScoreboardTimer(options){
        options = options || {};

        var that = this,
            oldOnUpdate = options.onUpdate;

        if(options.startTime){
            options.startTime = this._parse(options.startTime);
        }

        if(options.endTime){
            options.endTime = this._parse(options.endTime);
        }

        options.onUpdate = function(value){
            if(oldOnUpdate){
                oldOnUpdate(that._format(value));
            }
        };

        this._counter = new Counter(options);

        this._counter.checkValues();
    }

    ScoreboardTimer.prototype._parse = function(value){
        if(!isNaN(value)){
            return Math.ceil(Number(value));
        }

        var parts = (value || "").toString().replace(/\D+/g, ":").replace(/^\D*|\D*$/g, "").split(":"),
            seconds = Number(parts.pop()) || 0,
            minutes = Number(parts.pop()) || 0,
            hours = Number(parts.pop()) || 0;

        return hours * 3600 + minutes * 60 + seconds;
    }

    ScoreboardTimer.prototype._format = function(value){
        value = Number(value) || 0;

        var seconds = Math.round(value / 1000),
            hours, minutes, response = [];

        hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;

        minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;

        if(hours){
            response.push((hours < 10 ? "0" : "") + hours);
        }

        response.push((minutes < 10 ? "0" : "") + minutes);
        response.push((seconds < 10 ? "0" : "") + seconds);

        return response.join(":");
    }

    ScoreboardTimer.prototype.update = function(value){
        this._counter.update(this._parse(value));
        this._counter.checkValues();
    }

    ScoreboardTimer.prototype.increment = function(value){
        this._counter.increment(this._parse(value));
        this._counter.checkValues();
    }

    ScoreboardTimer.prototype.start = function(){
        this._counter.start();
    }

    ScoreboardTimer.prototype.stop = function(){
        this._counter.stop();
    }

    // Exposes to the world
    return function(options){
        return new ScoreboardTimer(options);
    };
}));