// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

import { JsonService } from '../../src/JsonService';

import chai from 'chai';
chai.should();
let assert = chai.assert;

describe("JsonService", function() {
    let subject;

    let stubHttpRequest;

    beforeEach(function(){
        stubHttpRequest = new StubXMLHttpRequest();
        subject = new JsonService(()=>stubHttpRequest);
    });

    describe("getJson", function() {

        it("should require a url parameter", function() {
            try {
                subject.getJson();
            }
            catch(e) {
                return;
            }

            assert.fail();
        });

        it("should return a promise", function() {
            let p = subject.getJson("http://test");
            p.should.be.instanceof(Promise);
        });

        it("should make GET request to url", function() {
            let p = subject.getJson("http://test");
            stubHttpRequest.method.should.be.equal('GET');
            stubHttpRequest.url.should.be.equal('http://test');
        });

        it("should set token as authorization header", function() {
            let p = subject.getJson("http://test", "token");
            stubHttpRequest.headers.has('Authorization').should.be.true;
            stubHttpRequest.headers.get('Authorization').should.be.equal('Bearer token');
        });

        it("should fulfill promise when http response is 200", function(done) {
            let p = subject.getJson("http://test");

            p.then(result => {
                result.should.not.be.undefined;
                result.foo.should.be.equal(1);
                result.bar.should.be.equal('test');

                done();
            });

            stubHttpRequest.status = 200;
            stubHttpRequest.responseText = JSON.stringify({foo:1, bar:'test'});
            stubHttpRequest.onload();
        });

        it("should reject promise when http response is not 200", function(done) {
            let p = subject.getJson("http://test");

            p.then(result => {
                assert.fail();
            }, error => {
                error.should.be.instanceof(Error);
                error.message.should.contain('500');
                error.message.should.contain('server error');
                done();
            });

            stubHttpRequest.status = 500;
            stubHttpRequest.statusText = "server error";
            stubHttpRequest.onload();
        });

        it("should reject promise when http response is error", function(done) {
            let p = subject.getJson("http://test");

            p.then(result => {
                assert.fail();
            }, error => {
                error.should.be.instanceof(Error);
                error.message.should.be.equal('Network Error');
                done();
            });

            stubHttpRequest.onerror();
        });
    });
});

class StubXMLHttpRequest {
    constructor() {
        this.headers = new Map();
    }

    open(method, url) {
        this.method = method;
        this.url = url;
    }

    setRequestHeader(header, value){
        this.headers.set(header, value);
    }

    send() {
    }
}
