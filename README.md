# HTML to Draftjs converter for Volto

This is a simple REST api service made with NodeJS and Express that accept an html snippet and convert it into a draftjs data structure compatible with Volto.

This tool can be used for example when you migrate contents from an old Plone site to a new that uses Volto.

## Installation

Just run:

```shell
yarn install
```

## Usage

By default this service will run on port 3000.

You can change the port with `PORT` env var.

The only available route is "_/html_converter_" that accept one single parameter: `html`.

The response of this call is a json with converted data:

```json
{
    "data": {
        ...
    }
}
```

### Development mode

In development mode, just run it with node:

```shell
yarn start
```

### Production mode

You can use pm2 to manage this process. There is already an ecosystem file.

## Credits

This product has been developed with some help from

<a href="https://kitconcept.com/">
    <img src="https://kitconcept.com/logo.svg" alt="kitconcept" width="300" height="80"/>
</a>

## Authors

This product was developed by **RedTurtle Technology** team.

![RedTurtle Technology](https://avatars1.githubusercontent.com/u/1087171?s=100&v=4)
