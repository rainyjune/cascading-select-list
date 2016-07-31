function MYSelection(id, options) {
  this.rootElement = $('#'+id);
  this.options = options;
  this.buildElments();
  this.selectedValues = [];
  this.bindEvents();
}

MYSelection.prototype.buildElments = function() {
  this.rootElement.addClass('zysContainer');
  this.buildColumns();
  this.populateFirstColumn();
};

MYSelection.prototype.buildColumns = function() {
  var columnsCount = 1;
  if (this.options && this.options.apis && Array.isArray(this.options.apis)) {
    columnsCount = this.options.apis.length;
  }
  this.options.apis.forEach(function(currentValue, index, array) {
    var columnDiv = $('<div></div>').addClass('column');
    var apiUrl = typeof currentValue === "string" ? currentValue : currentValue.url; 
    var ulElement = $("<ul></ul>").attr('data-apiurl', apiUrl).attr('data-apiindex', index);
    columnDiv.append(ulElement);
    this.rootElement.append(columnDiv);
  }, this);
  this.rootElement.append($("<div style='clear:both;'></div>"));
};

MYSelection.prototype.populateFirstColumn = function() {
  var that = this;
  if (this.options && this.options.apis[0]) {
    var api = this.options.apis[0];
    
    var listDom = this.rootElement.find('.column').eq(0).find('ul');
    this.fetchItemData(api, function(data) {
      that.renderDataList(data, listDom);
    });
  }
};

MYSelection.prototype.fetchItemData = function(api, callback) {
  var parsedAPI = this.normalizeAPI(api);
  var apiUrl = parsedAPI.url;
  var parser = parsedAPI.parser;
  this.ajax(apiUrl,function(data){
    if (parser) {
      data = parser(data);
    }
    if(callback) {
      callback(data);
    }
  });
};

MYSelection.prototype.renderDataList = function(data, listDom) {
  listDom.html('');
  if (Array.isArray(data) && data.length > 0) {
    data.forEach(function(current, index, array){
      var itemElement = $("<li></li>").attr({'data-value': current.value, 'data-id': current.id}).append(current.text);
      listDom.append(itemElement);
    }, this);
  }
};

MYSelection.prototype.bindEvents = function() {
  var that = this;
  this.rootElement.on('click', '.column ul li', function(e) {
    var thisElement = $(this);
    if (thisElement.hasClass('active')) {
      return false;
    }
    thisElement.siblings().removeClass('active');
    thisElement.addClass('active');
    var id = $(this).attr('data-id');
    var parent = $(this).parent();
    var apiIndex = parseInt(parent.attr('data-apiindex'));
    var listDom = $('ul[data-apiindex="'+ (apiIndex + 1) +'"]');
    var queryAPI = that.options.apis[apiIndex + 1];
    that.resetColumnContents(apiIndex);
    that.resetSelectedValues(apiIndex, {
      "id": id,
      "text": thisElement.text(),
      "value": thisElement.attr('data-value')
    });
    that.fireEventListener('changed', that.getSelectedValues());
    if (queryAPI && listDom) {
      that.fetchItemData(that.normalizeAPI(queryAPI, id), function(data){
        that.renderDataList(data, listDom);
      });
    }
  });
};

MYSelection.prototype.normalizeAPI = function(api, id) {
  var apiUrl = '';
  var parser = null;
  if (typeof api === "string") {
    apiUrl = api;
  } else if (typeof api === "object") {
    if (typeof api.url === "string") {
      apiUrl = api.url;
    }
    if (typeof api.parser === "function") {
      parser = api.parser;
    }
  }
  if (id) {
    apiUrl = apiUrl.replace('{id}', id);
  }
  return {
    url: apiUrl,
    parser: parser
  };
};

MYSelection.prototype.resetColumnContents = function(apiIndex) {
  var count = this.options.apis.length;
  while (apiIndex < count - 1) {
    apiIndex++;
    $('ul[data-apiindex="'+ apiIndex +'"]').html('');
  }
};

MYSelection.prototype.resetSelectedValues = function(apiIndex, value) {
  this.selectedValues[apiIndex] = value;
  this.selectedValues.splice(apiIndex+1);
};

MYSelection.prototype.ajax = function(url, callback) {
  $.ajax({
    type: 'GET',
    url: url,
    dataType: 'json',
    success: callback,
    error: function(xhr, type){
      alert('Ajax error!');
    }
  });
};

MYSelection.prototype.addEventListener = function(eventName, callback) {
  this.rootElement.on(eventName, callback);
};

MYSelection.prototype.removeEventListener = function(eventName, callback) {
  this.rootElement.off(eventName, callback);
};

MYSelection.prototype.fireEventListener = function(eventName, args) {
  this.rootElement.trigger(eventName, args);
};

MYSelection.prototype.getSelectedValues = function() {
  return this.selectedValues;
};