#!/bin/bash

print_line() {
	echo
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' .
}

usage() {
	echo "Usage:"
	echo "	$0 -i	Install dependencies"
	echo "	$0 -u	Update dependencies"
	echo "	$0 -t	Create environment file templates"
	echo "	$0 -h	Print this message"
	echo
}

main() {
	if [ $# -eq 0 ]; then
		print_line
		echo "Missing arguments."
		usage
		exit 1
	fi

    while getopts "iuth" opt; do
        case ${opt} in
			h )
				print_line
				usage
				exit 0
				;;
			i )
				install
				break
				;;
			u )
				update
				break
				;;
			t )
				create_templates
				break
				;;
        esac
    done
}

create_package_file() {
cat << 'EOF' > package.json
{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {},
  "scripts": {
    "start": "react-scripts start",
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

}

install() {
	print_line
	echo "Initializing node environment..."
	create_package_file
	print_line
	echo "Installing node dependencies..."
	npm install @azure/msal-browser @azure/msal-react @emotion/react @emotion/style @emotion/styled @mui/material \
		@testing-library/jest-dom @testing-library/react @testing-library/user-event axios \
		jwt-decode react react-dom react-icons react-loading react-router-dom react-scripts styled-components web-vitals

}

# Function to get version from the string
get_version() {
    echo "$1" | awk -F'@' '{print $NF}'
}

# Function to get the package name from the string
get_package_name() {
    echo "$1" | awk -F'@' '{print $(NF-1)}'
}

compare_npm_lists() {
	print_line
	echo "Module update summary"

	OLD_LIST="$(echo "$1" | grep -v "$(pwd)" | awk -F' ' '{print $2}')"
	NEW_LIST="$(echo "$2" | grep -v "$(pwd)" | awk -F' ' '{print $2}')"

	# Define color codes
	bold=$(tput bold)
	reset=$(tput sgr0)
	green=$(tput setaf 2)

	# Convert the variables to arrays
	IFS=$'\n' read -rd '' -a OLD_ARRAY <<< "$OLD_LIST"
	IFS=$'\n' read -rd '' -a NEW_ARRAY <<< "$NEW_LIST"

	# Loop through OLD_ARRAY and compare with NEW_ARRAY
	for item1 in "${OLD_ARRAY[@]}"; do
	    name1=$(get_package_name "$item1")
	    VERSION1=$(get_version "$item1")
	    found=0

	    for item2 in "${NEW_ARRAY[@]}"; do
	        name2=$(get_package_name "$item2")
	        VERSION2=$(get_version "$item2")

	        if [ "$name1" == "$name2" ]; then
	            found=1
	            if [ "$VERSION1" != "$VERSION2" ]; then
	                echo -e "$name1: $VERSION1 -> ${bold}${green}$VERSION2${reset}"
	            fi
	            break
	        fi
	    done

	    if [ $found -eq 0 ]; then
	        echo "$name1: ${bold}${green}Removed"
	    fi
	done

}

update() {
	TOOK_ACTION='false'

	print_line
	echo "Fetching module list..."
	OLD_LIST="$(npm list)"
	echo "$OLD_LIST"

	print_line
	echo "Checking for outdated modules..."
	OUTDATED=$(npm outdated)
	echo "$OUTDATED" | grep ' ' && NEEDS_UPDATES='true' || NEEDS_UPDATES='false'
	echo

	if [ "$NEEDS_UPDATES" == 'true' ]; then

		while true; do
			read -rp "Update modules? (y/n): " yn
	            case $yn in
	                [Yy]* )
						TOOK_ACTION='true'
						npm update
	                    break
	                    ;;
	                [Nn]* )
	                    echo "Exiting..."
	                    exit 0
	                    ;;
	                * )
	                    echo "Please answer y or n."
	                    ;;
	            esac
		done
	fi

	print_line
	echo "Checking for major updates..."
	echo
	OUTDATED=$(npm outdated)
	echo "$OUTDATED" | grep ' ' && NEEDS_UPDATES='true' || NEEDS_UPDATES='false'

	echo
	if [ "$NEEDS_UPDATES" == 'true' ]; then
		while true; do
			read -p "Update the modules listed above to the latest major version? This could include breaking changes. (y\n): " yn
			case $yn in
				[Yy]* )
					TOOK_ACTION='true'
					print_line
					OUTDATED="$(echo "$OUTDATED" | grep -vE "^Package" | awk -F' ' '{print $1}')"
					echo "Uninstalling modules..."
					echo "$OUTDATED" | xargs npm uninstall

					print_line
					echo "Installing latest version of the modules..."
					echo "$OUTDATED" | xargs npm install
					break
					;;
				[Nn]* )
					break
					;;
				* )
		            echo "Please answer y or n."
		            ;;
			esac
		done
	else
		echo "No outdated modules..."
	fi

	if [ "$TOOK_ACTION" == 'true' ]; then
		print_line
		echo "Fetching the update module list..."
		NEW_LIST="$(npm list)"
		compare_npm_lists "$OLD_LIST" "$NEW_LIST"
	fi

}

create_templates() {
	print_line
	ENV_TEMPLATE_FILE="$(dirname $(realpath $0))/.env.template"
	
	echo "This will overwrite the following files:"
	echo "	- $ENV_TEMPLATE_FILE"

	echo
	CREATE_ENV='false'
	while true; do
		read -p "Create .env file template? (y/n): " yn
		case $yn in
			[Yy]* )
				CREATE_ENV='true'
				break
				;;
			[Nn]* )
				echo "Exiting..."
				exit 0
				;;
			* )
				echo "Please answer y or n."
				;;
		esac
	done

	if [ "$CREATE_ENV" == 'true' ]; then
		print_line
		echo "Creating files..."

		cat << 'EOF' > .env.template
REACT_APP_BACKEND_URL= # URL for backend app
REACT_APP_AZ_TENANT_ID=   # Azure tenant ID
REACT_APP_AZ_CLIENT_ID=   # Azure application ID
REACT_APP_AZ_ADMIN_GRP_ID=  # Entra group ID that defines any user as an admin of this application
EOF
		print_line
		echo "Created .env.template"
		echo
		echo "After modifying the file, rename/move them and restart the app"
		echo	
		echo "If you run it with npm:"
		echo "	mv .env.template .env && npm start"

		echo "If you want to build to static files:"
		echo "	mv .env.template .env && npm run build"
		fi
}

main $@