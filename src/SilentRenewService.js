// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

import { Log } from './Log';

export class SilentRenewService {

    constructor(userManager) {
        this._userManager = userManager;
    }

    start() {
        if (!this._callback) {
            this._callback = this._tokenExpiring.bind(this);
            this._userManager.events.addAccessTokenExpiring(this._callback);

            // this will trigger loading of the user so the expiring events can be initialized
            this._userManager.getUser().then(user=>{
                // deliberate nop
            }).catch(err=>{
                // catch to suppress errors since we're in a ctor
                Log.error("Error from getUser:", err.message);
            });
        }
    }

    stop() {
        if (this._callback) {
            this._userManager.events.removeAccessTokenExpiring(this._callback);
            delete this._callback;
        }
    }

    _tokenExpiring() {
        Log.debug("SilentRenewService automatically renewing access token");

        this._userManager.signinSilent().then(user => {
            Log.debug("Silent token renewal successful");
        }, err => {
            Log.error("Error from signinSilent:", err.message);
            this._userManager.events._raiseSilentRenewError(err);
        });
    }
}
