FROM node:21-alpine AS builder
ENV NODE_ENV production

WORKDIR /app
RUN npm install @azure/msal-browser @azure/msal-react @emotion/react @emotion/styled \
    @mui/material @testing-library/jest-dom @testing-library/react @testing-library/user-event \
    axios jwt-decode react react-dom react-icons react-loading react-router-dom react-scripts styled-components

COPY . .

RUN npm run build


FROM nginx:1.26.1-alpine as production
ENV NODE_ENV production

COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

LABEL maintainer="George Koulouris <gkoulouris@thecanopener.com>"
LABEL version="1.0.0"
LABEL project="EC2 Configs"

CMD ["nginx", "-g", "daemon off;"]