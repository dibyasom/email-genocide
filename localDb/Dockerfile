FROM postgres:13.2-alpine

USER postgres

# Expose the PostgreSQL port
EXPOSE 5432

# CMD ["psql", "--command="CREATE USER emailer WITH SUPERUSER PASSWORD 'emailer';"","&&\ 
#     createdb -O emailer emailer"]