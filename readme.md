Yet Another Chat App
====================

This is based on tbranyen's excellent [boiler-plate](https://github.com/tbranyen/backbone-boilerplate/tree/amd) for NodeJS/Backbone projects.  I suggest everybody use that so I can have more people to ask questions of.

Last updated to "broke main application code out..." from 2/13/12, c702081c87728f4275aa0fb074129fd997c9bff9

If someone knows a better way to merge in changes from another git project that's not really a fork, please let me know.

## Todo List ##
1. ~~rooms should use socket.io rooms to filter messages~~
2. ~~Some sort of user model~~
3. ~~Some sort of sessions~~
4. ~~Get the text input to the bottom of the screen, with messages moving upwards~~
5. ~~Room tab should indicate missed messages~~
6. ~~Listing users in rooms~~
7. Indication of users typing
8. Adding custom rooms
9. ~~Use MongoDB instead of Memory Store for sessions~~
10. Implement the login system descibed below
11. Allow customization of room fonts
12. Internationalization?
13. Automatic room creation for trending twitter topics

Note: This is a list of various technologies I'd like to try out.  Just because they're crossed off doesn't mean they're down well.  In fact, it almost gaurantees they were done hastily and half-baked so I could get that sweet, sweet rush of crossing something off a list.

## Login System Description ##
Guest account available by default.  Allows changing username, adding descriptors, rooms, etc., but nothing is stored.
If desired, can create a login which remembers settings.  Still should allow changing usernames (so should be identified by ID rather than name).