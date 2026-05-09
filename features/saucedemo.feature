# Application under test: https://www.saucedemo.com/
Feature: Sauce Demo e-commerce
  As a shopper
  I want to use Sauce Demo
  So that I can demonstrate a BDD automation flow on the interview application

  Background:
    Given I open the Sauce Demo login page

  Scenario: Successful login with standard user
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should see the inventory page

  Scenario: Locked out user sees an error
    When I log in with username "locked_out_user" and password "secret_sauce"
    Then I should see a login error containing "locked out"

  Scenario: Add Sauce Labs Backpack to cart
    When I log in with username "standard_user" and password "secret_sauce"
    And I add the product "Sauce Labs Backpack" to the cart
    Then the cart should show badge count 1

  Scenario: Complete checkout for one item
    When I log in with username "standard_user" and password "secret_sauce"
    And I add the product "Sauce Labs Backpack" to the cart
    And I open the shopping cart
    And I start checkout
    And I enter shipping "Ada" "Lovelace" "94043"
    And I finish the order
    Then I should see the order confirmation

  Scenario Outline: Login smoke for accepted users
    When I log in with username "<user>" and password "secret_sauce"
    Then I should see the inventory page

    Examples:
      | user                |
      | standard_user       |
      | problem_user        |
      | performance_glitch_user |
