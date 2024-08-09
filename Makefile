ODROID = root@192.168.1.101

# Transfer the app to the device
transfer:
	@scp -r * $(ODROID):~/emotiphai

# Creates a virtual environment
create-venv:
	@python3 -m venv ./venv

# Install dependencies
install:
	@pip install -r requirements.txt

# Runs the program
run:
	@./venv/bin/python3 main.py

# Extracts the database from odroid into our current location
extract-db:
	@scp data/db.sqlite patriciabota@192.168.1.111:/Users/patriciabota/database/

# Sets ip as master node
set-ip:
	@ifconfig wlan0 192.168.1.100 netmask 255.255.255.0 up && ip -6 addr flush wlan0

# Unsets ip as master node
unset-ip:
	@ifconfig wlan0 192.168.1.106/24

remove-db:
	@rm -rf data/*

log:
	@sudo journalctl -u your_service_name.service -f