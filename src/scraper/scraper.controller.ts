import { Controller, Get, Query } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('scrape-linkedin')
  async scrapeLinkedIn(@Query('url') url: string) {
    return this.scraperService.scrapeProfile(url);
  }
}
