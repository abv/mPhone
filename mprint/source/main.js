var mprint_id               = mprint.id;
var twilio_account_sid      = mprint.options.twilio_account_sid;
var twilio_auth_token       = mprint.options.twilio_auth_token;
var transcribe              = mprint.options.transcribe && mprint.options.transcribe != "0" ? true : false;
var twilio_base_url         = "https://"+twilio_account_sid+":"+twilio_auth_token+"@api.twilio.com/2010-04-01/Accounts/"+twilio_account_sid;
var voice_url               = "http://"+mprint_id+".mprinter.io/answer";
var sms_url                 = "http://"+mprint_id+".mprinter.io/sms";

var get_number_friendly_name = function(number_id){
    return "mPhone-"+mprint_id+"-"+number_id;
}

var get_number = function(number_id, callback){
    if (!twilio_account_sid || !twilio_auth_token){
        return callback(new Error("Twilio Account SID and/or Twilio Auth Token are not set. Set them in the Options tab of this mPrint."));
    }
    var lookup_number_url = twilio_base_url + "/IncomingPhoneNumbers.json?FriendlyName="+get_number_friendly_name(number_id);
    request(lookup_number_url, function (err, response, body) {
        if (err) return callback(err);
        var data = {};
        if (body) {
            data = JSON.parse(body);
        }
        if (response.statusCode != 200) {
            var message = 'Request error. Response code ' + response.statusCode;
            if (data.message) {
                message = message + ': ' + data.message;
            }
            return callback(new Error(message));
        }
        if (data.incoming_phone_numbers.length) {
            var number = data.incoming_phone_numbers[0];
            if (number.voice_url == voice_url && number.sms_url == sms_url) {
                return callback(null, data.incoming_phone_numbers[0]);
            }
        }
        return callback(null, false);
    });
}

mprint.registerURL("/", function(req, res) {
    if (req.query.number_id === undefined) {
        res.send('<meta http-equiv="refresh" content="0;/?number_id=0">');
    }
    var number_id = req.query.number_id;
    var render_error = function(err){
        res.send('<h1>Error</h1><p>'+err.message+'</p>');
    }
    get_number(number_id, function(err, number){
        if (err) render_error(err);
        if (!number) {
            res.send('<h1>Setup Number</h1><p><a href="/setup/new?number_id='+number_id+'">Setup a new number</a> or <a href="/setup/existing?number_id='+number_id+'">Use an existing number</a><p>');
        } else {
            res.send('<h1>Setup Number</h1><p>Using'+number.phone_number+'<p>');
        }
    });
});

mprint.registerURL("/setup/new", function(req, res) {
    var html = '<h1>Setup a new number</h1><form method="post"><label>Area Code <input name="area_code" value="'+(req.body.area_code ? req.body.area_code : '')+'"/></label><input type="submit" value="Search"/></form>';
    if (req.method == "POST") {
        if (!req.body.phone_number) {
            var available_numbers_url = twilio_base_url + "/AvailablePhoneNumbers/US/Local.json?AreaCode="+req.body.area_code;
            request(available_numbers_url, function (err, response, body) {
               if (!err && response.statusCode == 200) {
                   var data = JSON.parse(body);
                   if (data.available_phone_numbers.length) {
                        data.available_phone_numbers.forEach(function(number){
                           html += "<form method='post'><input type='hidden' name='phone_number' value='"+number.phone_number+"' \>"+number.phone_number+"<input type='submit' value='Use'/></form>"; 
                       });
                   } else {
                        html += "<p>No numbers found.</p>";
                    }
                } else {
                    html += "<p>Error.</p>";
                }
                res.send(html);
            });
        } else {
            request.post(
                twilio_base_url + "/IncomingPhoneNumbers.json",
                { form: { PhoneNumber: req.body.phone_number,VoiceUrl:voice_url, SmsUrl:sms_url, FriendlyName: get_number_friendly_name(req.query.number_id)} },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        res.send('<a href="/?number_id='+req.query.number_id+'">Done</a>');
                    } else {
                        res.send('Error');
                    }
               }
            );
        }
    } else {
        res.send(html);
    }
});

mprint.registerURL("/setup/existing", function(req, res) {
    if (req.method == "POST") {
        if (!req.body.sid) {
            var html = '<h1>Searching for existing numbers: '+req.body.number+'</h1>';
            var search_numbers_url = twilio_base_url + "/IncomingPhoneNumbers.json?PhoneNumber="+ent.encode(req.body.number);
            request(search_numbers_url, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    if (data.incoming_phone_numbers.length) {
                        data.incoming_phone_numbers.forEach(function(number){
                            html += "<form method='post'><input type='hidden' name='sid' value='"+number.sid+"' \>"+number.phone_number+"<input type='submit' value='Use'/></form>"; 
                        });
                    } else {
                        html += "<p>No existing numbers.</p>";
                    }
                } else {
                    html += "<p>Error.</p>";
                }
                res.send(html);
            });
        } else {
            request.post(
                twilio_base_url + "/IncomingPhoneNumbers/"+req.body.sid+".json",
                { form: { VoiceUrl:voice_url, SmsUrl:sms_url, FriendlyName: get_number_friendly_name(req.query.number_id)} },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        res.send('<a href="/?number_id='+req.query.number_id+'">Done</a>');
                    } else {
                        res.send('Error');
                    }
               }
            );
        }
    } else {
        res.send('<h1>Setup an existing number</h1><p>Search for an existing number in your Twilio account. Leave blank to search all.</p><form method="post"><label>Number <input name="number" value=""/></label><input type="submit" value="Search"/></form>');
    }
});


mprint.registerURL("/answer", function(req, res) {
    var twiml = '<?xml version="1.0" encoding="UTF-8" ?><Response><Say>Please leave a message</Say><Record action="/voicemail" '+(transcribe ? 'transcribeCallback="/transcribe"' : '')+'/></Response>';
    res.send(twiml, {'Content-Type':'text/xml'}, 200);
});

mprint.registerURL("/voicemail", function(req, res) {    
    var options = {"type":"Voicemail","from":req.body.From,"to":req.body.To,"recording":req.body.RecordingUrl};
    if (options.recording) {
        if (transcribe) {
            var twiml = '<?xml version="1.0" encoding="UTF-8" ?><Response><Say>Thank you. Goodbye.</Say></Response>'
            res.send(twiml, {'Content-Type':'text/xml'}, 200);
        } else {
            mprint.queue(options, function(err) {
                mprint.debug(err);
                var twiml = '<?xml version="1.0" encoding="UTF-8" ?><Response><Say>Thank you. Goodbye.</Say></Response>'
                res.send(twiml, {'Content-Type':'text/xml'}, 200);
            }); 
        } 
    } else {
        var twiml = '<?xml version="1.0" encoding="UTF-8" ?><Response><Say>An error has occured. Goodbye.</Say></Response>'
        res.send(twiml, {'Content-Type':'text/xml'}, 200);
    }
});

mprint.registerURL("/transcribe", function(req, res) {
    var options = {"type":"Voicemail","from":req.body.From,"to":req.body.To,"text":req.body.TranscriptionText,"recording":req.body.RecordingUrl};
    mprint.queue(options, function(err) {
        mprint.debug(err);
        res.send({ status: "ok" });
    }); 
});

mprint.registerURL("/test", function(req, res) {
    var options = {"type":"Test","from":"+12125555555","to":"+12125555555","text":"Hello world"};
    mprint.queue(options, function(err) {
        mprint.debug(err);
        res.send({ status: "ok" });
    }); 
});

mprint.registerURL("/sms", function(req, res) {
    var options = {"type":"SMS","from":req.body.From,"to":req.body.To,"text":req.body.Body};
    if (options.text) {
        mprint.queue(options, function(err) {
            mprint.debug(err);
            res.send({ status: "ok" });
        });  
    } else {
        res.send({ status: "error" });
    }
});

mprint.preparePrint(function(options) {
    var type = options.type;
    var text = options.text;
    var recording = options.recording;
    var date = moment();
    var from = options.from;
    var to = options.to;
    mprint.appendHTML("<h3>"+type+"</h3>");
    if (recording) {
        mprint.appendHTML("<p>");
        mprint.insertQR(recording);
        mprint.appendHTML("</p>");
    }
    if (text) {
        mprint.appendHTML("<p>");
        mprint.appendHTML(text);
        mprint.appendHTML("</p>");
    }
    mprint.appendHTML("<p>From: "+from+"<br>To: "+to+"<br>Recieved: "+date.format('MMMM Do YYYY, h:mm:ss a')+"</p>");
    mprint.publish();
});