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

install() {
	print_line
	echo "Initializing node environment..."
	npm init
	print_line
	echo "Installing node dependencies..."
	npm install axios cors dotenv express @kubernetes/client-node mysql passport passport-azure-ad uuid
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
	green=$(tput setaf 3)


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
	UNIT_TEMPLATE_FILE="$(dirname $(realpath $0))/ec2c.service.template"
	ENV_TEMPLATE_FILE="$(dirname $(realpath $0))/.env.template"


	echo "This will overwrite the following files:"
	echo "	- $ENV_TEMPLATE_FILE"
	echo "	- $UNIT_TEMPLATE_FILE"
	echo
	echo "After modifying the files, rename/move them and restart the app"
	echo	
	echo "If you run it in the foreground:"
	echo "	mv .env.template .env && node index.js"

	echo "If you run it using systemd:"
	echo "	sudo cp ec2c.service.template /etc/systemd/system/ec2c.service && sudo systemctl daemon-reload && sudo systemctl restart ec2c"

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
				break
				;;
			* )
				echo "Please answer y or n."
				;;
		esac
	done

	CREATE_UNIT='false'
	while true; do
		read -p "Create unit file? (useful if you plan to run the app with systemd) (y/n): " yn
		case $yn in
			[Yy]* )
				CREATE_UNIT='true'
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

	if [[ "$CREATE_ENV" == 'true' || "$CREATE_UNIT" == 'true' ]]; then
		print_line
		echo "Creating files..."
	fi

	if [ "$CREATE_ENV" == 'true' ]; then
		cat << 'EOF' > .env.template

# Azure tenant ID
AZ_TENANT_ID=
# Azure application ID
AZ_CLIENT_ID=
# Entra group ID that defines any user as an admin of this application
AZ_ADMIN_GRP_ID=

# IP or hostname of the DB
DB_HOST=
# Port that the DB is listening to
DB_PORT=3306
# Database user
DB_USER=ec2cdbuser
# Database password
DB_PASSWORD=

# ============ Do not change this block unless you know what you're doing ==============
# Do not change
APP_ENV=local
# Config of the cluster. Only necessary when running workloads on kubernetes
KUBE_CONFIG_FOLDER=~/.kube
# Change based on what you are running your python workloads on (local/docker/kubernetes)
PYTHON_ENV=local
# Change only to change the python environment when run locally (use full path using a VENV)
PYTHON_EXEC=python3
# Directory containing all the python scripts. Used when python is executed locally or on docker
PYTHON_SCRIPT_ROOT_PATH=../python
# Change based on what you are running your terraform workloads on (local/docker/kubernetes)
TERRAFORM_ENV=local

# Directory that will contain all of the stored configurations
HOST_DATA_ROOT_FOLDER=/appData/configs
# Directory that will contain all of the logs of the app
HOST_DATA_LOGS_FOLDER=/appData/logs
# Directory containing the mirrored terraform providers
HOST_DATA_PROVIDERS_FOLDER=/appData/providers

# Database name
DB_DATABASE=ec2c
# ============ Do not change this block unless you know what you're doing ==============
EOF

		echo "Created .env.template"
	fi

	if [ "$CREATE_UNIT" == 'true' ]; then
	cat << 'EOF' > ec2c.service.template
[Unit]
Description=EC2 Configs Backend

[Service]
ExecStart=/usr/bin/node /app/backend/index.js

# Output to syslog
# StandardOutput=syslog
# StandardError=syslog
SyslogIdentifier=ec2c
RestartSec=3
Restart=always

WorkingDirectory=/app/backend/

# ======== Modify this Block =============
# Fix this based on the user you created
User=ec2cadmin
Group=ec2cadmin

# Azure tenant ID
Environment=AZ_TENANT_ID=
# Azure application ID
Environment=AZ_CLIENT_ID=
# Entra group ID that defines any user as an admin of this application
Environment=AZ_ADMIN_GRP_ID=

# IP or hostname of the DB
Environment=DB_HOST=
# Port that the DB is listening to
Environment=DB_PORT=3306
# Database user
Environment=DB_USER=ec2cdbuser
# Database password
Environment=DB_PASSWORD=
#========= Modify only the block above ===============


# ============ Do not change this block unless you know what you're doing ==============
# Do not change
Environment=APP_ENV=local
# Config of the cluster. Only necessary when running workloads on kubernetes
Environment=KUBE_CONFIG_FOLDER=~/.kube
# Change based on what you are running your python workloads on (local/docker/kubernetes)
Environment=PYTHON_ENV=local
# Change only to change the python environment when run locally (use full path using a VENV)
Environment=PYTHON_EXEC=python3
# Directory containing all the python scripts. Used when python is executed locally or on docker
Environment=PYTHON_SCRIPT_ROOT_PATH=../python
# Change based on what you are running your terraform workloads on (local/docker/kubernetes)
Environment=TERRAFORM_ENV=local

# Directory that will contain all of the stored configurations
Environment=HOST_DATA_ROOT_FOLDER=/appData/configs
# Directory that will contain all of the logs of the app
Environment=HOST_DATA_LOGS_FOLDER=/appData/logs
# Directory containing the mirrored terraform providers
Environment=HOST_DATA_PROVIDERS_FOLDER=/appData/providers

# Database name
Environment=DB_DATABASE=ec2c
# ============ Do not change this block unless you know what you're doing ==============

[Install]
WantedBy=multi-user.target
EOF
		echo "Created ec2c.service.template"
	fi
}

main $@
