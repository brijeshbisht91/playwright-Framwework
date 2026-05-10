Feature: Sauce Demo e-commerce
  As a shopper
  I want to use Sauce Demo
  So that I can demonstrate a BDD automation flow on the interview application

  Background:
    Given I open the Sauce Demo login page

@priceValidation
Scenario Outline: Verify product filter functionality
  When I log in with username "<username>" and password "<password>"
  Then I should see the inventory page
  And I filter the products by "<filterType>"

Examples:
  | username      | password     | filterType            |
  | standard_user | secret_sauce | Price (low to high)  |
  | standard_user | secret_sauce | Price (high to low)   |
  | standard_user | secret_sauce | Name (A to Z)         |
  | standard_user | secret_sauce | Name (Z to A)         |