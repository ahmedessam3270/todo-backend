import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Builder, By, Key, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private linkedInEmail = this.configService.get('LINKEDIN_EMAIL');
  private linkedInPassword = this.configService.get('LINKEDIN_PASSWORD');
  constructor(private readonly configService: ConfigService) {}

  async connectToDriver() {
    try {
      const chromeOptions = new chrome.Options();
      chromeOptions.addArguments('--disable-extensions');
      chromeOptions.addArguments('--disable-popup-blocking');
      chromeOptions.addArguments('--profile-directory=Default');
      chromeOptions.addArguments('--disable-plugins-discovery');
      chromeOptions.addArguments('--incognito');
      chromeOptions.addArguments('--headless');
      chromeOptions.addArguments('--no-sandbox');
      chromeOptions.addArguments('--disable-dev-shm-usage');

      return await new Builder()
        .usingServer(this.configService.get('SELENIUM_GRID_URL'))
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();
    } catch (e) {
      this.logger.error(e);
    }
  }

  async destroyConnection(driver: WebDriver) {
    try {
      await driver?.quit();
    } catch (e) {
      this.logger.error(e);
    }
  }

  async scrapeProfile(url: string) {
    if (!url) {
      return { error: 'LinkedIn URL is required' };
    }
    let driver = null;
    try {
      driver = await this.connectToDriver();
      // Login to LinkedIn
      await driver.get('https://www.linkedin.com/login');
      await driver.manage().setTimeouts({ implicit: 5000 });
      const emailInput = await driver.findElement(By.id('username'));
      const passwordInput = await driver.findElement(By.id('password'));
      await emailInput.sendKeys(this.linkedInEmail); // Add your LinkedIn email Address
      await passwordInput.sendKeys(this.linkedInPassword, Key.RETURN); // Add your LinkedIn Password
      await driver.get(url);
      await driver.manage().setTimeouts({ implicit: 5000 });
      // Select the first section element inside the main element
      const mainElement = await driver.findElement(By.css('main'));
      const profileSection = await mainElement.findElement(
        By.css('section:first-of-type'),
      );

      // Name
      const secondDiv = await profileSection.findElement(
        By.css('div:nth-of-type(2)'),
      );
      const name = await secondDiv.findElement(By.css('h1')).getText();

      // Image
      const imgElement = await secondDiv.findElement(
        By.css(`img:first-of-type`),
      );
      const image = await imgElement.getAttribute('src');

      return { name, image };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('Error scraping profile');
    } finally {
      await this.destroyConnection(driver);
    }
  }
}
