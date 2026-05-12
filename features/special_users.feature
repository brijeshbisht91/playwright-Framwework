Feature: Sauce Demo special user scenarios
  As an interviewer testing automation robustness
  I want to validate behavior with special test users
  So that I can identify issues and edge cases in the application

  Background:
    Given I open the Sauce Demo login page

  @locked_out_user @negative @authentication
  Scenario: Locked out user authentication validation
    When I log in with username "locked_out_user" and password "secret_sauce"
    Then I should see a login error containing "locked out"
    And I should remain on the login page
    And the login form should still be accessible

  @problem_user @ui @bug_detection
  Scenario: Problem user UI behavior validation
    When I log in with username "problem_user" and password "secret_sauce"
    Then I should see the inventory page
    And I should be able to interact with inventory items
    But some images may not load correctly
    And some buttons may behave unexpectedly

  @problem_user @ui @detail_glitch
  Scenario: Problem user list vs detail mismatch when opening product via image
    When I log in with username "problem_user" and password "secret_sauce"
    Then I should see the inventory page
    When I open the product detail for "Sauce Labs Backpack" by clicking its product image
    Then the item detail page should show a different price and image than on the inventory list

  @performance_glitch_user @performance @timeout
  Scenario: Performance glitch user slow response handling
    When I submit performance glitch user credentials with password "secret_sauce" and wait for inventory within 30000 milliseconds
    And page loads should complete within reasonable time limits

  @error_user @negative @checkout
  Scenario: Error user reaches checkout overview with empty last name
    When I log in with username "error_user" and password "secret_sauce"
    Then I should see the inventory page
    When I add the product "Sauce Labs Backpack" to the cart
    And I open the shopping cart
    And I start checkout
    And I enter shipping "Test" "" "12345"
    Then I should be on checkout step two overview
    And no checkout error banner should be visible

  @error_user @negative @api
  Scenario: Error user inventory remove triggers failing Backtrace JSON submit
    When I log in with username "error_user" and password "secret_sauce"
    Then I should see the inventory page
    When I add the product "Sauce Labs Backpack" to the cart
    When I remove the product "Sauce Labs Backpack" from the cart on the inventory page waiting for failed Backtrace telemetry
    And the product "Sauce Labs Backpack" should still be in the cart on the inventory page with badge count 1

  @visual_user @visual @regression
  Scenario: Visual user UI consistency validation
    When I log in with username "visual_user" and password "secret_sauce"
    Then I should see the inventory page
    And the inventory shopping cart layout should deviate from the golden baseline by at least 80 pixels

  @visual_user @visual @responsive
  Scenario: Visual user responsive design check
    When I log in with username "visual_user" and password "secret_sauce"
    Then I should see the inventory page
    When I resize the browser window
    Then the inventory shopping cart layout should deviate from the golden baseline by at least 80 pixels