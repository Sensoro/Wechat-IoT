;(function(window, undefined){
  Vue.directive('drag', {
    isLiteral: true,
    bind: function(){
      var _pressEvents = 'touchstart mousedown';
      var _moveEvents = 'touchmove mousemove';
      var _releaseEvents = 'touchend mouseup';
      var el = this.el;
      var isdrag=false;
      var _mx, _my, _mrx, _mry, _tx, _ty, offset, _dragOffset;

      function inputEvent(event) {
        if(event.touches && event.touches[0]){
          return event.touches[0];
        }else if(event.originalEvent && event.originalEvent.targetTouches && event.originalEvent.targetTouches[0]){
          return event.originalEvent.targetTouches[0];
        }else {
          return event;
        }
      }

      function onpress(e){
        if($(e.target).data("disdrag")) return;
        isdrag = true;
        e.preventDefault();
        offset = $(el).offset();
        el.centerX = $(el).width() / 2;
        el.centerY = $(el).height() / 2;
        _mx = inputEvent(e).pageX;
        _my = inputEvent(e).pageY;
        _mrx = _mx - offset.left;
        _mry = _my - offset.top;
        _tx = offset.left - $(window).scrollLeft();
        _ty = offset.top - $(window).scrollTop();
        moveElement(_tx, _ty);
        $(document).on(_moveEvents, onmove);
        $(document).on(_releaseEvents, onrelease);
      }

      function onmove(e){
        if (!isdrag) return;
        e.preventDefault();
        _mx = inputEvent(e).pageX;
        _my = inputEvent(e).pageY;
        _tx = _mx - _mrx - $(window).scrollLeft();
        _ty = _my - _mry - $(window).scrollTop();
        moveElement(_tx, _ty);
      }

      function onrelease(e){
        if(!isdrag) return;
        e.preventDefault();
        $(document).off(_moveEvents, onmove);
        $(document).off(_releaseEvents, onrelease);
      }


      function moveElement(x, y){
        $(el).css({left:x,top:y, position:'fixed', 'z-index':99999, margin: '0'});
        // $(el).css({
        //   transform: 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + x + ', ' + y + ', 0, 1)',
        //   'z-index': 99999,
        //   '-webkit-transform': 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + x + ', ' + y + ', 0, 1)',
        //   '-ms-transform': 'matrix(1, 0, 0, 1, ' + x + ', ' + y + ')'
        // });
      }

      $(el).on(_pressEvents, onpress);

      $(el).on("touchcancel", function(){
        if(isdrag){
          isdrag = false;
          $(document).off(_moveEvents, onmove);
          $(document).off(_releaseEvents, onrelease);
        }
      });
    }
  });


})(window);