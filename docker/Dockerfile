FROM alpine:latest

# Install Nginx and PHP 8.3 with FPM
RUN apk update && apk add --no-cache \
    nginx \
    php83 \
    php83-fpm \
    php83-mysqli \
    php83-json \
    php83-session \
    php83-curl \
    php83-xml \
    php83-mbstring \
    php83-zip \
    php83-gd \
    php83-sqlite3 \
    php83-intl \
    php83-opcache \
    php83-tokenizer \
    php83-ctype \
    php83-dom \
    curl \
    && rm -rf /var/cache/apk/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Create directory for the application
RUN mkdir -p /var/www/html

# Configure Nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/http.d/default.conf

# Configure PHP-FPM
RUN sed -i 's/;listen.owner = nobody/listen.owner = nginx/' /etc/php83/php-fpm.d/www.conf && \
    sed -i 's/;listen.group = nobody/listen.group = nginx/' /etc/php83/php-fpm.d/www.conf && \
    sed -i 's/listen = 127.0.0.1:9000/listen = 127.0.0.1:9000/' /etc/php83/php-fpm.d/www.conf

# Configure PHP logs to be sent to container's stderr
RUN echo 'error_log = /proc/self/fd/2' >> /etc/php83/php.ini

# Configure PHP-FPM logs to stderr
RUN sed -i 's|error_log = /var/log/php83/fpm.log|error_log = /proc/self/fd/2|' /etc/php83/php-fpm.d/www.conf

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'php-fpm83 &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Set working directory
WORKDIR /var/www/html

# Copy project content to container
COPY . .

# Ensure tmp directory exists and has write permissions for nginx
RUN mkdir -p tmp && chown -R nginx:nginx /var/www/html/tmp && chmod -R 775 /var/www/html/tmp

# Change ownership of /var/www/html to nginx (general)
RUN chown -R nginx:nginx /var/www/html

# Expose port 80
EXPOSE 80

# Command to start Nginx and PHP-FPM
CMD ["/start.sh"]