# ShopBlock Core Backend

## Build a environment and install dependencies

If you already have one, then use it

```
python3 -m venv ./swe-env
source ./swe-env/bin/activate
pip3 install -r requirements.txt
```

## Install the DB

Especially if it's the first time

```
python3 manage.py migrate
```

## If you have made changes to the db / models.py file

Please be careful when you make changes here.

```
python3 manage.py makemigrations
python3 manage.py migrate
```

## Run the server

```
python3 manage.py runserver
```

## Testing the website

Use the swagger-ui to test. Ensure that your model and views reflect here properly.

```
go to http://localhost:8000/api/schema/swagger-ui/
```

### Developer Notes

- models.py is the ORM models corresponding to the database.
- serializers.py can be thought of as the input/output for the models
- urls.py lists all the endpoints and the corresponding views that will respond to which request
- view.py lists all the controllers, they will be mapped onto urls.py and are the main functionality for the features
