var DICTIONARY_URL = 'http://codekata.com/data/wordlist.txt';
var FNV_PRIME_32_BIT = 0x01000193;
var FNV_OFFSET_32_BIT = 0x811c9dc5;

// find the byte values for string
function stringToBytes(str) {
  var ch;
  var st;
  var re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i);  // get char
    st = [];                 // set up "stack"
    do {
      st.push(ch & 0xFF);  // push byte to stack
      ch = ch >> 8;          // shift value down by 1 byte
    }
    while (ch);
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

// based on http://www.isthe.com/chongo/tech/comp/fnv/index.html#FNV-source
function fnv1(str) {
  var bytes = stringToBytes(str);
  var hash = FNV_OFFSET_32_BIT;
  for (var i = 0; i < bytes.length; i++) {
    hash *= FNV_PRIME_32_BIT;
    hash ^= bytes[i];
  }
  return Math.abs(hash);
}

function fnv1a(str) {
  var bytes = stringToBytes(str);
  var hash = FNV_OFFSET_32_BIT;
  for (var i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash *= FNV_PRIME_32_BIT;
  }
  return Math.abs(hash);
}

var hashBits = 10000000;
var bitArray = [];

function bloom(s) {
  //clear the text input box
  $('#addtoset').val('');

  var a = fnv1(s) % hashBits;
  var b = fnv1a(s) % hashBits;

  bitArray[a] = true;
  bitArray[b] = true;
}

function checkWord(evt) {
  var s = $('#membership').val();

  var a = fnv1(s) % hashBits;
  var b = fnv1a(s) % hashBits;

  if (bitArray[a] && bitArray[b]) {
    $('#ismember').html('maybe!');
  } else {
    $('#ismember').html('no');
  }

  $('#fnv1Mem').html(a);
  $('#fnv1aMem').html(b);
}

function readDictionary() {

  $.get(DICTIONARY_URL, function(myContentFile) {
    // var start = new Date().getTime();
    var words = myContentFile.split('\n');
    $.each(words, function(index, value) {
      bloom(value);
    });
    // var end = new Date().getTime();
    // var time = (end - start) / 1000;
    // alert('Dictionary loading done! in ' + time + ' seconds');
    $('#dictionaryStatus').html('Dictionary loaded with ' +
    words.length + ' words!!!');
  }, 'text');
}

$(function() {

  //Initialize bloom filter bit array
  for (var i = 0; i < hashBits; i++) {
    bitArray[i] = false;
  }

  //handle a click on the "add to bloom filter" button
  $('#hash').click(function() {
    var s = $('#addtoset').val();
    $('#fnv1Hash').html(fnv1(s) % hashBits);
    $('#fnv1aHash').html(fnv1a(s) % hashBits);
    bloom(s);
  });

  $("#dictionary").on("mousedown",function()
   {
     $('#dictionaryStatus').html('Dictionary is loading ... Please wait');
   });

  $("#dictionary").on("mouseup",function() {
    readDictionary();
  });

  // handle enter key on "add to bloom filter" form
  $('#addtoset').keydown(function(event) {
    if (event.keyCode == '13') {
      event.preventDefault();
      $('#hash').click();
    }
  });

  $('#dictionaryStatus').html('Dictionary NOT loaded!!!');

  $('#membership').keyup(checkWord);

});
