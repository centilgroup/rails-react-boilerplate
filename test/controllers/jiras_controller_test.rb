require 'test_helper'

class JirasControllerTest < ActionDispatch::IntegrationTest
  setup do
    @jira = jiras(:one)
  end

  test "should get index" do
    get jiras_url
    assert_response :success
  end

  test "should get new" do
    get new_jira_url
    assert_response :success
  end

  test "should create jira" do
    assert_difference('Jira.count') do
      post jiras_url, params: { jira: {  } }
    end

    assert_redirected_to jira_url(Jira.last)
  end

  test "should show jira" do
    get jira_url(@jira)
    assert_response :success
  end

  test "should get edit" do
    get edit_jira_url(@jira)
    assert_response :success
  end

  test "should update jira" do
    patch jira_url(@jira), params: { jira: {  } }
    assert_redirected_to jira_url(@jira)
  end

  test "should destroy jira" do
    assert_difference('Jira.count', -1) do
      delete jira_url(@jira)
    end

    assert_redirected_to jiras_url
  end
end
