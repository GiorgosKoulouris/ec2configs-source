# Use the official MariaDB base image
FROM mariadb:latest

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=root_password_placeholder \
    MYSQL_DATABASE=mydatabase_placeholder \
    MYSQL_USER=custom_user_placeholder \
    MYSQL_PASSWORD=custom_password_placeholder

# Copy the SQL dump file and init script to the container
COPY ec2c-init-dump.sql /docker-entrypoint-initdb.d/
COPY ec2c-init-user.sql /docker-entrypoint-initdb.d/

# Expose the default MariaDB port
EXPOSE 3306
