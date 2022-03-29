ARCHITECTURE=$(arch)

install_from_source () {
  echo "Installing rover from source"
  curl -O -L https://raw.githubusercontent.com/JesusFilm/core/%40apollo/rover-0.2.1-arm-64/rover
  chmod +x rover
  mkdir /home/node/.local
  mkdir /home/node/.local/bin
  mv rover /home/node/.local/bin
}

if ! command -v rover &> /dev/null
then
  if [ "$ARCHITECTURE" = "aarch64" ] 
  then
    install_from_source
  else
    npm install -g @apollo/rover@0.2.1
  fi
else
  echo "@apollo/rover already installed"
fi