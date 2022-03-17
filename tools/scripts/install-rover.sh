ARCHITECTURE=$(arch)

install_from_source () {
  echo "Installing rover from source"
  curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain nightly -y
  source $HOME/.cargo/env
  cargo install --git https://github.com/apollographql/rover.git --tag v0.4.8 rover
}

if ! command -v rover &> /dev/null
then
  if [ "$ARCHITECTURE" = "aarch64" ] 
  then
    install_from_source
  else
    npm install -g @apollo/rover@0.4.8
  fi
else
  echo "@apollo/rover already installed"
fi