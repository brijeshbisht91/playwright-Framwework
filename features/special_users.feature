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

  @problem_user @ui @cart
  Scenario: Problem user cart functionality with UI issues
    When I log in with username "problem_user" and password "secret_sauce"
    Then I should see the inventory page
    When I attempt to add "Sauce Labs Backpack" to the cart
    Then the cart badge should update correctly despite UI inconsistencies

  @performance_glitch_user @performance @timeout
  Scenario: Performance glitch user slow response handling
    When I log in with username "performance_glitch_user" and password "secret_sauce"
    Then I should eventually see the inventory page after delays
    And page loads should complete within reasonable time limits

  @performance_glitch_user @performance @actions
  Scenario: Performance glitch user action delays
    When I log in with username "performance_glitch_user" and password "secret_sauce"
    Then I should see the inventory page
    When I add the product "Sauce Labs Backpack" to the cart
    Then the cart should show badge count 1 after potential delays

  @error_user @negative @checkout
  Scenario: Error user checkout failure simulation
    When I log in with username "error_user" and password "secret_sauce"
    Then I should see the inventory page
    When I add the product "Sauce Labs Backpack" to the cart
    And I open the shopping cart
    And I start checkout
    And I enter shipping "Test" "User" "12345"
    Then I should encounter system errors during checkout process

  @error_user @negative @api
  Scenario: Error user API error triggering
    When I log in with username "error_user" and password "secret_sauce"
    Then I should see the inventory page
    When I attempt various actions that may trigger API errors
    Then appropriate error handling should be displayed

  @visual_user @visual @regression
  Scenario: Visual user UI consistency validation
    When I log in with username "visual_user" and password "secret_sauce"
    Then I should see the inventory page
    And the UI layout should be consistent
    And visual elements should render correctly
    And no unexpected layout shifts should occur

  @visual_user @visual @responsive
  Scenario: Visual user responsive design check
    When I log in with username "visual_user" and password "secret_sauce"
    Then I should see the inventory page
    When I resize the browser window
    Then the layout should adapt appropriately without visual issues

  @interview @comprehensive
  Scenario Outline: Comprehensive special user behavior validation
    When I log in with username "<username>" and password "secret_sauce"
    Then I should validate "<expected_behavior>" for "<user_type>"

    Examples:
      | username                | user_type             | expected_behavior                          |
      | locked_out_user         | authentication        | login blocked with error message           |
      | problem_user            | ui_bugs               | inventory accessible but with UI issues     |
      | performance_glitch_user | performance           | slow responses but functional              |
      | error_user              | error_handling        | system errors during workflows             |
      | visual_user             | visual_consistency    | UI rendering and layout validation         |