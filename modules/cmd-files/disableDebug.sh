#!/bin/bash
/usr/libexec/PlistBuddy -c "Delete:PlayerDebugMode" ~/Library/Preferences/com.adobe.CSXS.7.plist
/usr/libexec/PlistBuddy -c "Delete:PlayerDebugMode" ~/Library/Preferences/com.adobe.CSXS.8.plist
/usr/libexec/PlistBuddy -c "Delete:PlayerDebugMode" ~/Library/Preferences/com.adobe.CSXS.9.plist
#must kill cfprefsd to take effect
killall "cfprefsd"