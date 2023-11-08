import { expect, test } from '@playwright/test';

import { LandingPage } from '../pages/landing-page';

test('User can login and logout', async ({ page }) => {
    const landingpage = new LandingPage(page);
    
    await landingpage.open();
    await landingpage.goToLoginPage();
    await new LoginPage(page).login(user.email, user.password)

    const userIsLoggedIn = await landingpage.userIsLoggedIn();
    expect(userIsLoggedIn).toBeTruthy();

    await landingpage.goToSettings();
    await new SettingsPage(page).logout();

    const userIsLoggedOut = await new LogoutPage(page).userIsLoggedOut();
    expect(userIsLoggedOut).toBeTruthy();
  });