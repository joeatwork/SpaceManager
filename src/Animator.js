Animator = (function(){

    var Animator = function(rate) {
	this.rate = rate;
	this.frames = 0;
    };

    Animator.prototype.fps = function() {
        var timeMs = (new Date()) - this.frameZero;
        return Math.floor(this.frames/(timeMs/1000));
    };

    Animator.prototype.resetFps = function() {
	this.frameZero = new Date();
	this.frames=0;
    };

    Animator.prototype.start = function(animation){
	var timeZero = new Date();
	this.frameZero = new Date();
	var animator = this;

	setInterval(function() {
            var ticksMs = (new Date()) - timeZero;
            var ticks = ticksMs / 100;
            animator.frames++;

	    animation(ticks);
	}, this.rate);
    };

    return Animator;
})();
