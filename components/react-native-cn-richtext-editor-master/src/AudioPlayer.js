

import React from 'react';
import Sound from 'react-native-sound';
import Slider from '@react-native-community/slider';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
    StyleSheet,
    Animated,
    View,
    Alert,
  } from 'react-native';

export default class AudioPlayer extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            duration: 0,
            playSeconds: 0,
            curAudioTime: 0,
            isPlaying: false,
            audioInstance: {},
            progressStatus: 0,
            currentAudioIndex: 0,
            animationStart: false,
            animationValue: new Animated.Value(0),
        }
    }



    shouldComponentUpdate(nextProps, nextState){
      if(this.state.isPlaying && this.props.currentPlayIndex !== this.props.index){
        console.log('dont play');
        this.pausePlayingAudio();
        return false;
      }
      return true;
    }

    startPlayingAudio(item, index) {
        this.props.setCurrent(index);
        this.playAudio(item, index);
    }
    
      pausePlayingAudio() {
        this.pauseAudio();
    }

      pauseAudio = () => {
        if (Object.keys(this.state.audioInstance).length !== 0 && this.state.isPlaying) {
          this.state.audioInstance.getCurrentTime((seconds) => {
            clearInterval(this.timeout);
            this.state.audioInstance.pause();
            this.setState({isPlaying: false});
            this.setState({playSeconds: seconds});
          });
        }
      };
    
      onSliderCompleteEditing = (value) => {     
        this.setState({playSeconds: value});  
      };

      onSliderEditing = () => {
        this.pauseAudio();
      }

      playAudio(item, index) {
        const voiceNote = new Sound( item.url , '', (err) => {
          if (err) {
            console.log(err);
            Alert.alert('an error has occurred');
          } else {
            this.setState({isPlaying: true}, () => {
              this.setState({currentAudioIndex: index}, () => {
                this.setState({audioInstance: voiceNote}, () => {
                  voiceNote.setCurrentTime(this.state.playSeconds);
    
                    this.setState({duration: voiceNote.getDuration()});
    
                    voiceNote.play((success) => {
                      if (success) {
                        voiceNote.release();
                        clearInterval(this.timeout);
                        this.setState({playSeconds: 0});
                        this.setState({curAudioTime: 0});
                        this.setState({isPlaying: false});
                        this.setState({currentAudioIndex: 123654});
                        console.log('successfully finished playing');
                      } else {
                        console.log('playback failed due to audio decoding errors');
                      }
                  });
    
                  this.timeout = setInterval(() => {
                    voiceNote.getCurrentTime((seconds, isPlaying) => {
                      this.setState({playSeconds: seconds});
                    });
                  }, 100);
                });
              });
            });
          }
        });
      }
   
    render() {

        return (
            <View style={[styles(this.props.theme).audio]}>
                <View style={{flexDirection: 'row', zIndex: 100}}>
                  {this.state.isPlaying  && this.props.currentPlayIndex === this.props.index? (
                    <AntDesign
                      name="pausecircle"
                      size={35}
                      color={this.props.type === 'audio'?"tomato":"grey"}
                      style={{left: 7}}
                      onPress={() => this.pausePlayingAudio()}
                    />
                  ) : (
                    <AntDesign
                      name="play"
                      size={35}
                      color={this.props.type === 'audio'?"tomato":"grey"}
                      style={{left: 7}}
                      onPress={() => this.startPlayingAudio(this.props.item, this.props.index)}
                    />
                  )}                 
                  <Slider                                               
                    thumbTintColor={this.props.type === 'audio'?"tomato":"black"}
                    maximumTrackTintColor="black"
                    minimumTrackTintColor="black"               
                    style={{flex: 1, width: 120}}
                    value={this.state.playSeconds}
                    maximumValue={this.state.duration}
                    onValueChange={this.onSliderEditing}  
                    onSlidingComplete={this.onSliderCompleteEditing}
                  />
                </View>               
                   
            </View>
          );
    }
}

const styles = (theme) => StyleSheet.create({
    audio: {
        height: 50,
        width: 170,
        backgroundColor: theme === 'DARK' ? '#eeeeee' : '#f2f2f2',
        borderRadius: 5,
        justifyContent: 'center',
        marginTop: 10,
      },
})