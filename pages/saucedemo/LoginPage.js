import { expect } from '@playwright/test'
import { SAUCE_DEMO_URL } from '../../config/constants.js';

export class SauceLoginPage {


    constructor(page) {
        this.page = page;
        this.username = page.locator('#user-name');
        this.password = page.locator('#password');
        this.loginButton = page.locator('#login-button');
        this.errorBanner = page.locator('[data-test="error"]');

    }

    async open() {
        this.page.goto(SAUCE_DEMO_URL, { waitUntil: 'domcontentloaded' })
    }

    //action 

    async login(username, password) {
        await this.username.fill(username);
        await this.password.fill(password);
        await this.loginButton.click();

    }


    //assertion 
    async expectErrrorContains(text) {
        await expect(this.errorBanner).toContainText(text);

    }

}