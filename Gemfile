source "https://rubygems.org"

# When you want to use a different Jekyll version, change it below, save the
# file and run `bundle install`. Run Jekyll with `bundle exec`, like so:
#
#     bundle exec jekyll serve
gem "jekyll", "~> 4.3.4"

# Modern Ruby (3.4+/4.0) removed these from default gems; Jekyll 4.3.4 still needs them.
gem "logger"
gem "csv"
gem "base64"
gem "webrick"

# Plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows.
# Disabled: its native extension fails to build on modern Ruby (uses a
# removed GVL API). Without it, Jekyll just polls for file changes instead
# of using OS-level file events -- slightly slower, but works.
# gem "wdm", "~> 0.1.1", :install_if => Gem.win_platform?
