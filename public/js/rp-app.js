function getRegisterChallenge() {
    return new Promise(function(resolve, reject) {
        console.log("getRegisterChallenge");
        var fidoAttestationChallengeEndpoint = "/auth/webauthn/register";
        var challengeReq = {
            username: document.getElementById("username").value, // TODO: check first
            op: "registerChallenge"
        };
        console.log("challengeReq", challengeReq);

        // get challenge from server
        var xhr = new XMLHttpRequest();
        xhr.open("POST", fidoAttestationChallengeEndpoint, true);
        // xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(JSON.stringify(challengeReq));
        xhr.onload = function() {
            console.log("XMLHttpRequest.onload got response for getRegisterChallenge:");
            console.log(xhr.response);
            if (xhr.status != 200) {
                console.log("Status:", xhr.status);
                var errorMsg = JSON.parse(xhr.response).error;
                return reject(xhr.status + ": " + errorMsg);
            } else {
                console.log("Success receiving challenge");
                return resolve(xhr.response);
            }
        };
    });
}

function sendRegisterResponse(cred) {
    return new Promise(function(resolve, reject) {
        console.log("sendRegisterResponse");
        var fidoServerRegisterEndpoint = "/auth/webauthn/register";
        cred.op = "register";

        // send registration to server
        var xhr = new XMLHttpRequest();
        console.log("sending request to:", fidoServerRegisterEndpoint);
        // xhr.responseType = "document";
        xhr.open("POST", fidoServerRegisterEndpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        console.log("Sending:", cred);
        xhr.send(JSON.stringify(cred));
        xhr.onload = function() {
            if (xhr.status !== 200) {
                console.log("ERROR");
                console.log(xhr.status);
                console.log(xhr.response);
                return;
            }
            console.log("done");
            // console.log (xhr.responseXML);
            console.log(xhr.response);

            // document.innerHtml = xhr.responseXML;
            document.write(xhr.response);
            document.close();
            // console.log("XMLHttpRequest.onload got response:");
            // console.log(xhr.response);
            // // TODO: check response to make sure it's okay
            // var elem = document.getElementById("success");
            // elem.innerHTML = "Success! Redirecting to login page...";
            // setTimeout(function() {
            //     window.location = "/login.html";
            // }, 3000);
        };
    });
}

function fidoRegister() {
    console.log("fidoRegister");

    // stop default submit event
    event.preventDefault();

    // TODO: get registration request from server
    var accountInfo = {
        rpDisplayName: 'WebAuth Demo App', // human readable name of service
        displayName: document.getElementById("username").value // name of person registering

    };

    var cryptoParameters = [{
        type: 'FIDO_2_0',
        algorithm: 'RSASSA-PKCS1-v1_5'
    }];

    console.log("doing get challenge");
    getRegisterChallenge()
        .then(function(challenge) {
            console.log("Doing makeCredential");
            return window.webauthn.makeCredential(accountInfo, cryptoParameters);

            // // dummy credential
            // var cred = {
            //     credential: {
            //         type: 'ScopedCred',
            //         id: '8DD7414D-EE43-474C-A05D-FDDB828B663B'
            //     },
            //     publicKey: {
            //         kty: 'RSA',
            //         alg: 'RS256',
            //         ext: false,
            //         n: 'lMR4XoxRiY5kptgHhh1XLKnezHC2EWPIImlHS-iUMSKVH32WWUKfEoY5Al_exPtcVuUfcNGtMoysAN65PZzcMKXaQ-2a8AebKwe8qQGBc4yY0EkP99Sgb80rAf1S7s-JRNVtNTRb4qrXVCMxZHu3ubjsdeybMI-fFKzYg9IV6DPotJyx1OpNSdibSwWKDTc5YzGfoOG3vA-1ae9oFOh5ZolhHnr5UkodFKUaxOOHfPrAB0MVT5Y5Stvo_Z_1qFDOLyOWdhxxzl2at3K9tyQC8kgJCNKYsq7-EFzvA9Q90PC6SxGATQoICKn2vCNMBqVHLlTydBmP7-8MoMxefM277w',
            //         e: 'AQAB'
            //     },
            //     attestation: null
            // };
            // console.log("makeCredential done, returned:");
            // console.log(cred);
            // return cred;
        })
        .then(function(cred) {
            console.log("Doing sendRegisterResponse");
            cred.username = accountInfo.displayName;
            return sendRegisterResponse(cred);
        })
        .catch(function(err) {
            console.log("makeCredential error:", err);
            throw err;
        });
}

function getLoginChallenge() {
    return new Promise(function(resolve, reject) {
        console.log("getLoginChallenge");
        var fidoAssertionChallengeEndpoint = "/auth/webauthn";
        var challengeReq = {
            username: document.getElementById("username").value,
            op: "authChallenge"
        };

        // get challenge from server
        var xhr = new XMLHttpRequest();
        xhr.open("POST", fidoAssertionChallengeEndpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        // xhr.send(JSON.stringify(req));
        var x = JSON.stringify(challengeReq);
        console.log(x);
        xhr.send(x);
        xhr.onload = function() {
            console.log("XMLHttpRequest.onload got response for challenge:");
            console.log(xhr.response);
            if (xhr.status != 200) {
                console.log("Status:", xhr.status);
                var errorMsg = JSON.parse(xhr.response).error;
                return reject(xhr.status + ": " + errorMsg);
            } else {
                console.log("Success receiving challenge");
                return resolve(xhr.response);
            }
        };
    });
}

function sendLoginResponse(assn) {
    return new Promise(function(resolve, reject) {
        console.log("sendLoginResponse");
        var fidoServerLoginEndpoint = "/auth/webauthn";
        assn.op = "auth";

        // send login request to server
        var xhr = new XMLHttpRequest();
        xhr.open("POST", fidoServerLoginEndpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        // xhr.send(JSON.stringify(req));
        assn.clientData = btoa(String.fromCharCode.apply(null, new Uint8Array(assn.clientData)));
        assn.authenticatorData = btoa(String.fromCharCode.apply(null, new Uint8Array(assn.authenticatorData)));
        assn.signature = btoa(String.fromCharCode.apply(null, new Uint8Array(assn.signature)));

        var resp = JSON.stringify(assn);
        // convert ArrayBuffers to base64 encoded strings
        console.log("SENDING", resp);
        xhr.send(resp);
        xhr.onload = function() {
            console.log("XMLHttpRequest.onload got response for login:");
            if (xhr.status !== 200) {
                console.log("ERROR");
                console.log(xhr.status);
                console.log(xhr.response);
                return;
            }
            console.log("done");
            // console.log (xhr.responseXML);
            console.log(xhr.response);

            // document.innerHtml = xhr.responseXML;
            document.write(xhr.response);
            document.close();
        };
    });
}

function fidoLogin() {
    console.log("fidoLogin");

    // stop default submit event
    event.preventDefault();

    var challenge = "abc123def456"; // TODO: get challenge from server
    var whitelist = [{
        type: 'ScopedCred',
        id: "8DD7414D-EE43-474C-A05D-FDDB828B663B"
    }];

    console.log("doing getAssertion");
    getLoginChallenge()
        .then(function(challenge) {
            console.log("Doing getAssertino");
            return webauthn.getAssertion(challenge, 300, whitelist, {});

            // // dummy assertion
            // var assn = {
            //     credential: {
            //         type: 'ScopedCred',
            //         id: '8DD7414D-EE43-474C-A05D-FDDB828B663B'
            //     },
            //     clientData: 'ew0KCSJjaGFsbGVuZ2UiIDogImFiYzEyM2RlZjQ1NiINCn0A',
            //     authenticatorData: 'AQAAAAA',
            //     signature: 'g22nh1Ww-qZAysuizkugZGmEisax3dtoUNzIl2LWOSARzeZxm_-nQoHfKyo8b8_XnxXwuLlW8RXBLAN38D3V2PBugPRloVzE1gn4Vl7Ro124GqPyURNllvNkD3EAl64bHPK-EVIOmI8zk0QK_ZoqfAKY_RfMLNObSn47H_hdA-YZUGEkWtcyUgC65H9xfhFWOQdg-r_pHY5_TxgdSNR8itkBb2xZGKagFnGUtdmOSRROVwK9AalJwsJD1W4lF5_4Jfumsb1YJ6yQwrPhJuYNCCeVHXIahXDUKTdTtWQs0MTj7kGi1j-_lkNpl7rEnSV4wqw8K5SEcHM-mEBYX-fMDw'
            // };
            // console.log("getAssertion done, got:");
            // console.log(assn);
            // return assn;
        })
        .then(function(assn) {
            console.log("Doing sendLoginResponse");
            console.log("Assn:", assn);
            assn.username = document.getElementById("username").value; // TODO: check first
            return sendLoginResponse(assn);
        })
        .catch(function(err) {
            console.log("getAssertion error:", err);
            throw err;
        });
}