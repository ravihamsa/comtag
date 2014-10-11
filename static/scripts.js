var triggerMethod = (function () {

    // split the event name on the ":"
    var splitter = /(^|:)(\w)/gi;

    // take the event section ("section1:section2:section3")
    // and turn it in to uppercase name
    function getEventName(match, prefix, eventName) {
        return eventName.toUpperCase();
    }

    // actual triggerMethod implementation
    var triggerMethod = function (event) {
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


var getOption = function (target, optionName) {
    if (!target || !optionName) {
        return;
    }
    var value;

    if (target.options && (target.options[optionName] !== undefined)) {
        value = target.options[optionName];
    } else {
        value = target[optionName];
    }

    return value;
};

var proxyGetOption = function (optionName) {
    return getOption(this, optionName);
};



var baseApp = _.extend({}, Backbone)

var BaseView = Backbone.View.extend({
    render: function () {
        this.triggerMethod('pre:render');
        this.renderTemplate();
        this.triggerMethod('post:render');
        return this;
    },
    renderTemplate: function () {
        var template = this.template;
        if (_.isString(template)) {
            template = Handlebars.compile(template);
            this.template = template;
            this.attachHtml();
        } else if (_.isFunction(template)) {
            this.attachHtml();
        }

    },
    attachHtml: function () {
        //console.log(this.serialize());
        this.$el.html(this.template(this.serialize()));
    },
    serialize: function () {
        if (this.model) {
            return this.model.toJSON();
        } else if (this.collection) {
            return {
                records: this.collection.toJSON()
            }
        }

    },
    getOption: proxyGetOption,
    triggerMethod: triggerMethod
})


var PhotoView = BaseView.extend({
    template: '<div class="photo-container"> <h2 class="title">{{name}}</h2> <div class="img"> <img src="{{source}}"> </div></div>',
    tagName: 'li'
})


var documentEl = $(document);

var TagView = BaseView.extend({
    events:{
        'mouseenter .fa':'handleMouseEnter',
        'click .remove-but':'removeTag',
        'click .collapse-but':'collapseTag'
    },
    template: '<i class="fa fa-tag fa-2x"></i> <div class="form"> <input type="text" name="details" class="auto-input"> <a href="#remove" class="remove-but"> <i class="fa fa-close"> </i> </a></div> ',
    className: 'tag',
    onPostRender: function () {
        var _this = this;
        var attributes = _this.model.toJSON();
        _this.$el.css({
            left: attributes.left,
            top: attributes.top
        });
        _this.$el.addClass('pulse');

        _this.initAutoComplete()

        _this.model.on('change:hover', function(){
            _this.syncHover();
        })
        _this.syncHover();
    },
    handleMouseEnter: function(){
        this.model.collection.trigger('hoverModel', this.model);
    },
    initAutoComplete: function(){
        var a = this.$('.auto-input').autocomplete({
            serviceUrl:'/data/listings.json',
            minChars:2,
            maxHeight:400,
            width:300,
            zIndex: 9999,
            deferRequestBy: 0, //miliseconds
            noCache: false, //default is false, set to true to disable caching
            onSelect: function(value, data){ console.log('You selected: ' , value ,', ' + data); }
        });
        console.log(a);
    },
    syncHover: function(){
        var _this = this;
        var hover = _this.model.get('hover');
       if(hover){
           _this.$el.addClass('hover')
           documentEl.off('click.outside');
           documentEl.on('click.outside', function(event) {
               var tagParent = $(event.target).closest('.tag');
               if(!tagParent.length) {
                   _this.collapseTag();
               }
           })

       }else{
           _this.$el.removeClass('hover');
       }
        setTimeout(function(){
            if(hover){
                _this.$('input').focus();
            }
        }, 100)
    },
    removeTag: function(){
        this.model.collection.trigger('removeTag', this.model);
    },
    collapseTag: function(){
        this.model.collection.trigger('clearHoverModel', this.model);
    }
})

var ReadOnlyTagView = TagView.extend({
    template: '<i class="fa fa-tag fa-2x"></i> <div class="form"> <a href="#">URL to the landing page</a> </div> '
});

var TagCollection = Backbone.Collection.extend({
    initialize: function (options) {
        this.photoId = options.photoId;
    },
    url: function () {
        return '/comtag/taglist/' + this.photoId;
    },
    parse: function(arr){
         _.each(arr, function(item){
            item.hover = false;
        })
        return arr;

    }
})

var PhotoDetailView = BaseView.extend({
    initialize: function () {
        var _this = this;

        _this.tagCounter = 0;
        this.listenTo(baseApp, 'selectPhoto', function (photoId) {
            _this.setPhotoId(photoId)
        });

        _this.fetchTagCollection();
    },
    template: '<div class="photo-detail" style="margin: 0 auto;"><div class="img"> <img src="{{source}}" style="width:auto; height: 500px;"> </div> <div class="overlay"> <div class="tag-list"></div> </div> <div class="footer"> <button class="btn post-to-wall"> Post to Wall</button></div> </div>',
    events: {
        'click .tag-list': 'addTag',
        'click .post-to-wall':'postToWall',
        'click .tag-your-photos':'tagYourPhotos'
    },
    fetchTagCollection: function(){
        var _this = this;
        _this.tagCollection = new TagCollection({
            photoId: _this.model.id
        });

        var hoverModel

        _this.tagCollection.on('hoverModel',function(model){
            if(hoverModel){
                if(hoverModel.id === model.id){
                    return;
                }
            }

           _this.tagCollection.each(function(eachModel){
               eachModel.set('hover', false);
           })
            model.set('hover', true);
            hoverModel = model;
        })

        _this.tagCollection.on('clearHoverModel', function(model){
            if(hoverModel){
              hoverModel.set('hover', false);
            }
            hoverModel = null;
        });

        _this.tagCollection.on('removeTag',function(model){
            _this.tagCollection.remove(model);
        });

        _this.tagCollection.fetch().done(function(){
            _this.tagCounter = _this.tagCollection.length;
            _this.renderTagList();
        });
    },
    setPhotoId: function (photoId) {
        this.model = this.model.collection.get(photoId);
        this.render();
        this.fetchTagCollection();
    },
    addTag: function (e) {
        var target  = $(e.target);

        if(target.hasClass('tag-list')){
            var _this = this;
            var tagMeta = {
                left: e.offsetX,
                top: e.offsetY,
                id: _this.model.id + '_'+_this.tagCounter++,
                hover:false
            }
            _this.tagCollection.add(tagMeta);
            _this.saveTags();
            //_this.renderTagList();
        }

    },
    renderTagList: function () {
        var _this = this;
        var tagListContainer = _this.$('.tag-list');
        tagListContainer.empty();

        _this.tagViewIndex = {};

        _this.tagCollection.each(function (model) {
            _this.renderTag(model);
        });

        this.listenTo(this.tagCollection, 'add', function(model){
            _this.renderTag(model);
        })

        this.listenTo(this.tagCollection, 'remove', function(model){
            _this.removeTag(model);
        })
    },
    renderTag: function(model){
        var _this = this;
        var tagListContainer = _this.$('.tag-list');

        var tagView = new TagView({
            model: model
        })

        _this.tagViewIndex[model.id]=tagView;
        tagView.render();
        tagView.$el.appendTo(tagListContainer);
    },
    removeTag: function(model){
        this.tagViewIndex[model.id].remove();
        this.saveTags();
    },
    saveTags: function () {
        this.tagCollection.each(function(model){
            model.unset('hover');
        })
        $.ajax({type: "POST",
            url: '/comtag/taglist/' + this.model.id,
            data:JSON.stringify(this.tagCollection.toJSON())});

        this.saveImage();
    },
    saveImage: function(){
        console.log('saving image');
        $.ajax({type: "POST",
            url: '/comtag/images/' + this.model.id,
            data:JSON.stringify(this.model.toJSON())});
    },
    onPostRender: function(){
        var _this = this;
        var image = this.$('.img img');
        if(image.width() !== 0){
            _this.resetOverlayWidth();
        }else{
           image.on('load', function(){
               _this.resetOverlayWidth();
           });
        }
    },
    resetOverlayWidth: function(){
        this.$('.tag-list').width(this.$('.img img').width());
    },
    postToWall: function(){
        var tags = this.tagCollection.map(function(model){
            return model.id;
        });

        FB.api(
            "/me/feed",
            "POST",
            {
                "message": "checkout what I brought "+ tags.join(','),
                "name":"Tag Your Wear",
                "link":"https://apps.facebook.com/comtagapp/"+this.model.id,
                "picture":this.model.get('source'),
                "privacy":{value:'EVERYONE'}
            },
            function (response) {
                if (response && !response.error) {
                    top.location.href="https://www.facebook.com"
                }
            }
        );
    },
    tagYourPhotos: function(){
        top.location.href="https://apps.facebook.com/comtagapp/"
    }
})


var PhotoReadOnlyDetailView = PhotoDetailView.extend({
    template: '<div class="photo-detail read-only" style="margin: 0 auto;"><div class="img"> <img src="{{source}}" style="width:auto; height: 500px;"> </div> <div class="overlay"> <div class="tag-list"></div> </div> <div class="footer"> <button class="btn tag-your-photos"> Tag Your Photos</button> </div>',
    renderTag: function(model){
        var _this = this;
        var tagListContainer = _this.$('.tag-list');

        var tagView = new ReadOnlyTagView({
            model: model
        })

        _this.tagViewIndex[model.id]=tagView;
        tagView.render();
        tagView.$el.appendTo(tagListContainer);
    }
})

var PhotoCollectionView = BaseView.extend({
    tagName: 'ul',
    onPostRender: function () {
        var _this = this;
        this.collection.each(function (model) {
            _this.addItem(model);
        });


    },
    addItem: function (model) {
        var ChildView = this.getOption('ChildView') || PhotoView;
        var view = new ChildView({
            model: model
        }).render();
        this.$el.append(view.el);
    }
})


var ThumbView = BaseView.extend({
    template: '<div class="thumb-container"> <div class="img"> <a href="#selectPhoto" data-id="{{id}}" class="thumb-link"> <img src="{{picture}}"> </a></div></div>',
    tagName: 'li',
    events: {
        'click .thumb-link': 'handleImageSelection'
    },
    handleImageSelection: function () {
        baseApp.trigger('selectPhoto', this.model.id);
    }
})

var ThumbCollectionView = PhotoCollectionView.extend({
    ChildView: ThumbView
})

