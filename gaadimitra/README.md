npx react-native start --reset-cache --port 8081
npx react-native run-android --device IBR8X8YD4HYXUKIJ --port 8081
cd android
./gradlew clean
./gradlew assembleRelease
adb reverse tcp:5001 tcp:5001
adb reverse tcp:8081 tcp:8081;
11657314AN044099
npx react-native run-android --device 11657314AN044099 --port 8081
$env:Path="$env:JAVA_HOME\bin;$env:Path"