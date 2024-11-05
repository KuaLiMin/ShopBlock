# ShopBlock Core Backend

## Build a environment and install dependencies

If you already have one, then use it

```bash
python3 -m venv ./swe-env
source ./swe-env/bin/activate
pip3 install -r requirements.txt
```

## Install the DB

Especially if it's the first time

```bash
python3 manage.py migrate
```

## If you have made changes to the db / models.py file

Please be careful when you make changes here.

```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

## Run the server

```bash
python3 manage.py runserver
```

## Testing the website

Visit the Swagger UI for API testing at [http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/).

## Unit tests

```bash
python manage.py test
```

### Developer Notes

- models.py is the ORM models corresponding to the database.
- serializers.py can be thought of as the input/output for the models
- urls.py lists all the endpoints and the corresponding views that will respond to which request
- view.py lists all the controllers, they will be mapped onto urls.py and are the main functionality for the features
