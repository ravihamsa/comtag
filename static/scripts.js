var triggerMethod = (function() {

    // split the event name on the ":"
    var splitter = /(^|:)(\w)/gi;

    // take the event section ("section1:section2:section3")
    // and turn it in to uppercase name
    function getEventName(match, prefix, eventName) {
        return eventName.toUpperCase();
    }

    // actual triggerMethod implementation
    var triggerMethod = function(event) {
        // get the method name from the event name
        var methodName = 'on' + event.replace(splitter, getEventName);
        var method = this[methodName];
        var result;


        // call the onMethodName if it exists
        if (_.isFunction(method)) {
            // pass all arguments, except the event name
            result = method.apply(this, _.tail(arguments));
        }

        // trigger the event, if a trigger method exists
        if (_.isFunction(this.trigger)) {
            this.trigger.apply(this, arguments);
        }

        return result;
    };

    return triggerMethod;
})();


var getOption = function(target, optionName) {
    if (!target || !optionName) { return; }
    var value;

    if (target.options && (target.options[optionName] !== undefined)) {
        value = target.options[optionName];
    } else {
        value = target[optionName];
    }

    return value;
};

var  proxyGetOption = function(optionName) {
    return getOption(this, optionName);
};


var BaseView = Backbone.View.extend({
    render: function(){
        this.triggerMethod('pre:render');
        this.renderTemplate();
        this.triggerMethod('post:render');
        return this;
    },
    renderTemplate: function(){
        var template = this.template;
        if(_.isString(template)){
            template = Handlebars.compile(template);
            this.template = template;
            this.attachHtml();
        }
    },
    attachHtml: function(){
        console.log(this.serialize());
        this.$el.append(this.template(this.serialize()));
    },
    serialize: function(){
        return this.model.toJSON();
    },
    getOption:proxyGetOption,
    triggerMethod:triggerMethod
})



var PhotoView = BaseView.extend({
    template:'<div class="photo-container"> <h2 class="title">{{name}}</h2> <div class="img"> <img src="{{source}}"> </div></div>',
    tagName:'li'
})

var PhotoCollectionView = BaseView.extend({
    tagName:'ul',
    onPostRender: function(){
        var _this = this;
        this.collection.each(function(model){
            _this.addItem(model);
        })
    },
    addItem: function(model){
        var ChildView = this.getOption('ChildView') || PhotoView;
        var view= new ChildView({
            model:model
        }).render();
        this.$el.append(view.el);
    }
})


var ThumbView = BaseView.extend({
    template:'<div class="thumb-container"> <div class="img"> <a href="#selectPhoto" data-id="{{id}}"> <img src="{{picture}}"> </a></div></div>',
    tagName:'li'
})

var ThumbCollectionView = PhotoCollectionView.extend({
    ChildView:ThumbView
})

