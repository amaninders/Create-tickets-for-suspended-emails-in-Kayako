chrome.runtime.onMessage.addListener(function(msg) {
    if (msg === 'allow') {

        var domain = window.location.host.split(".")[0];
        var url = document.location.href.split("/");
        var index = url[url.length - 1];
        const mail = new XMLHttpRequest();
        var url= "https://" + domain + ".kayako.com/api/v1/mails/" + index;
        mail.open("GET", url);
        mail.send();

        mail.onreadystatechange = function() {
            if(this.readyState==4 && this.status==200){

                var obj = JSON.parse(mail.responseText);

                const form = new XMLHttpRequest();
                var link = "https://" + domain + ".kayako.com/api/v1/cases/forms.json?include=*&fields=is_default,fields(is_required_for_customers,type,key,options(id))";
                form.open("GET", link);
                form.send();

                form.onreadystatechange = function() {
                    if(this.readyState==4 && this.status==200){

                        var formObj = JSON.parse(form.responseText);
                        var custom_fields = {};
                        var formID;
                        var post_form_id;

                        for (let index = 0; index < formObj.data.length; index++) {
                            if (formObj.data[index].is_default) {
                                formID = index;
                                post_form_id = formObj.data[index].id;
                            }
                        }

                        for (let i = 0; i < formObj.data[formID].fields.length; i++) {
                            if(formObj.data[formID].fields[i].is_required_for_customers && formObj.data[formID].fields[i].id != 26 && formObj.data[formID].fields[i].id != 27) {
                                let x = formObj.data[formID].fields[i].type;
                                switch (x) {
                                case "TEXT":
                                    custom_fields[formObj.data[formID].fields[i].key] = "na";
                                    break;
                                case "TEXTAREA":
                                    custom_fields[formObj.data[formID].fields[i].key] = "na";
                                    break;
                                case "NUMERIC":
                                    custom_fields[formObj.data[formID].fields[i].key] = "123";
                                    break;
                                case "DATE":
                                    const event = new Date(Date.now());
                                    var xevent = event.toISOString();
                                    custom_fields[formObj.data[formID].fields[i].key] = xevent;
                                    break;
                                case "DECIMAL":
                                    custom_fields[formObj.data[formID].fields[i].key] = "1.0";
                                    break;
                                case "YESNO":
                                    custom_fields[formObj.data[formID].fields[i].key] = "Yes";
                                    break;  
                                case "SUBJECT":
                                    custom_fields[formObj.data[formID].fields[i].key] = obj.data.subject;
                                    break;  
                                case "MESSAGE":
                                    custom_fields[formObj.data[formID].fields[i].key] = obj.data.text;
                                    break;                                          
                                default:
                                    custom_fields[formObj.data[formID].fields[i].key] = formObj.data[formID].fields[i].options[0].id;
                                }
                            }
                        } 

                        console.log(custom_fields);

                        var pipeURL = "https://95c93bfa24ad0a036f36a9f3bbf09a86.m.pipedream.net";
                        var myHeaders = new Headers();
                        myHeaders.append("Content-Type", "application/json;charset=UTF-8");

                        var raw = JSON.stringify({"domain":domain,"name":obj.data.from,"form_id":post_form_id,"email":obj.data.from,"subject":obj.data.subject,"contents":obj.data.text,"fields":custom_fields});
                        
                        var requestOptions = {
                            method: 'POST',
                            headers: myHeaders,
                            body: raw,
                            redirect: 'follow'
                        };

                        fetch(pipeURL, requestOptions);
                    }
                }
            }
        }
    }
});

