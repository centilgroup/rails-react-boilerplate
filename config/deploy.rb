
# frozen_string_literal: true

# require 'slackistrano/capistrano'
# require_relative "../lib/custom_messaging"
# config valid for current version and patch releases of Capistrano
puts "*************************************************************************************************"
puts "*************************************************************************************************"
puts "***********      Deployment        **************************************************************"
lock "~> 3.14.1"

set :application, "rails-react-boilerplate"
set :repo_url, "git@github.com:centilgroup/rails-react-boilerplate"
set :use_sudo, false
set :branch, 'master'

set :rvm_type, :user
set :rvm_ruby_version, 'ruby-2.7.1'
set :rvm_binary, '~/.rvm/bin/rvm'


set :assets_roles, [:web, :app]
set :rails_assets_groups, :assets
set :linked_dirs, %w(log node_modules)
set :linked_dirs, fetch(:linked_dirs, []) << '.bundle'
set :bundle_flags, 'bundle install --deployment'
set :migration_role, :db
set :bundle_roles, :all                                         # this is default
set :bundle_binstubs, -> { shared_path.join('bin') }            # default: nil
set :bundle_gemfile, -> { release_path.join('Gemfile') } # default: nil
set :bundle_path, -> { shared_path.join('bundle') } # this is default. set it to nil for skipping the --path flag.
set :bundle_without, %w{development test}.join(' ') # this is default
set :bundle_flags, '--deployment --quiet' # this is default
# set :sidekiq_service_name, "sidekiq"
# set :sidekiq_config, "#{current_path}/config/sidekiq.yml"
# set :service_unit_name, "sidekiq.service"

# For Slack Notification
# set :slackistrano, {
#   klass: Slackistrano::CustomMessaging,
#   channel: '#devops',
#   webhook: 'https://hooks.slack.com/services/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'
# }

# This needs to be added
# set :linked_dirs, %w(config log tmp node_modules)
# set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml')

append :linked_files, "config/database.yml", "config/secrets.yml"
append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets"
# set :keep_releases, 1

set :conditionally_migrate, true
set :log_level, :debug
set :pty, true
set :format, :pretty

# # # Whenever gem
# set :whenever_identifier,   ->{ fetch :application }
# set :whenever_command,      ->{ [:bundle, :exec, :whenever] }
# set :whenever_update_flags, ->{ "--update-crontab #{fetch :whenever_identifier}" }

### Deploy Hooks
# before 'deploy:updated', 'deploy:yarn_install'
# after 'deploy:published', 'deploy:clobber_assets'
after 'deploy:updated', 'deploy:run_migrations'
# after 'deploy:starting', 'sidekiq:quiet'
# after 'deploy:published', 'sidekiq:restart'
after 'deploy:published', 'assets:deploy'
after 'deploy:published', 'deploy:restart_server'

namespace :assets do
  desc 'Prepares static assets'
  task :deploy do
    on roles(:app) do
      execute "cd #{current_path} && rm -rf node_modules && ~/.rvm/bin/rvm default do bundle exec rails assets:clobber RAILS_ENV=#{fetch(:rails_env)} && yarn && ~/.rvm/bin/rvm default do bundle exec rake assets:precompile RAILS_ENV=#{fetch(:rails_env)}"
    end
  end
end

# namespace :sidekiq do
#   desc 'Quiet sidekiq (stop fetching new tasks from Redis)'
#   task :quiet do
#     on roles(:app) do
#       execute :sudo, :systemctl, :kill, "-s", "TSTP", fetch(:sidekiq_service_name)
#     end
#   end

#   desc 'Restart sidekiq service'
#   task :restart do
#     on roles(:app) do
#       execute :sudo, :systemctl, :restart, fetch(:sidekiq_service_name)
#     end
#   end
# end

namespace :deploy do
  desc '================= Running migration ===================='
  task :run_migrations do
    puts 'RUNNING DB MIGRATIONS'
    on roles(:db) do
      execute "cd #{current_path} && ~/.rvm/bin/rvm default do bundle exec rails db:migrate RAILS_ENV=#{fetch(:rails_env)} --trace"
    end
  end
end

# config valid for current version and patch releases of Capistrano
# lock "~> 3.14.1"

# set :application, "my_app_name"
# set :repo_url, "git@example.com:me/my_repo.git"

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
# set :deploy_to, "/var/www/my_app_name"

# Default value for :format is :airbrussh.
# set :format, :airbrussh

# You can configure the Airbrussh format using :format_options.
# These are the defaults.
# set :format_options, command_output: true, log_file: "log/capistrano.log", color: :auto, truncate: :auto

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
# append :linked_files, "config/database.yml"

# Default value for linked_dirs is []
# append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "public/system"

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for local_user is ENV['USER']
# set :local_user, -> { `git config user.name`.chomp }

# Default value for keep_releases is 5
# set :keep_releases, 5

# Uncomment the following to require manually verifying the host key before first deploy.
# set :ssh_options, verify_host_key: :secure
