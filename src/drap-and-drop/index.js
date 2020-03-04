import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  PanResponder,
  Animated,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {sizeW} from '../helpers/size';
import {BOARD} from '../constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function immutableMove(arr, from, to) {
  return arr.reduce((prev, current, idx, self) => {
    if (from === to) {
      prev.push(current);
    }
    if (idx === from) {
      return prev;
    }
    if (from < to) {
      prev.push(current);
    }
    if (idx === to) {
      prev.push(self[from]);
    }
    if (from > to) {
      prev.push(current);
    }
    return prev;
  }, []);
}

function insertItem(array, action) {
  const newArray = array.slice();
  newArray.splice(action.index, 0, action.item);
  return newArray;
}

function removeItem(array, action) {
  return array.filter((item, index) => index !== action.index);
}

const colorMap = {};

const DragAndDrop = () => {
  const [dragging, setDraggingItem] = useState(() => ({
    index: -1,
    list: '',
    item: {},
  }));
  const [board, setBoard] = useState(() => ({
    backlog: {
      data: Array.from(Array(80), (_, i) => {
        colorMap[i] = getRandomColor();
        return {id: 111 + i, i};
      }),
    },
    inprogress: {
      data: Array.from(Array(80), (_, i) => {
        colorMap[i] = getRandomColor();
        return {id: 222 + i, i};
      }),
    },
    done: {
      data: Array.from(Array(80), (_, i) => {
        colorMap[i] = getRandomColor();
        return {id: 333 + i, i};
      }),
    },
  }));

  const [current] = useState(() => ({
    board: {scrollOffset: 0, flatlistTopOffset: 0, flatListHeight: 0},
    backlog: {scrollOffset: 0, flatlistTopOffset: 0, flatListHeight: 0},
    inprogress: {scrollOffset: 0, flatlistTopOffset: 0, flatListHeight: 0},
    done: {scrollOffset: 0, flatlistTopOffset: 0, flatListHeight: 0},
    x: 0,
    y: 0,
    rowHeight: 0,
    active: false,
    pointingList: 'backlog',
    point: new Animated.ValueXY(),
  }));
  const flatListRefs = {
    backlog: useRef(),
    inprogress: useRef(),
    done: useRef(),
    board: useRef(),
  };

  const yToIndex = (y, inserting) => {
    const value = Math.round(
      (current[current.pointingList].scrollOffset +
        y -
        current[current.pointingList].flatlistTopOffset -
        current.rowHeight) /
        current.rowHeight,
    );
    if (value <= 0) {
      return 0;
    }
    if (value > board[current.pointingList].data.length - 1) {
      return inserting
        ? board[current.pointingList].data.length
        : board[current.pointingList].data.length - 1;
    }

    return value;
  };

  const reoderBoard = () => {
    if (current.pointingList === dragging.list) return;
    const newIdx = yToIndex(current.y, true);
    setBoard({
      ...board,
      [current.pointingList]: {
        ...board[current.pointingList],
        data: insertItem(board[current.pointingList].data, {
          index: newIdx,
          item: dragging.item,
        }),
      },
      [dragging.list]: {
        ...board[dragging.list],
        data: removeItem(board[dragging.list].data, {index: dragging.index}),
      },
    });
    setDraggingItem({...dragging, index: newIdx, list: current.pointingList});
  };

  const animateList = () => {
    if (!current.active) {
      return;
    }
    // requestAnimationFrame(() => {
    if (current.x + 100 > sizeW(100)) {
      flatListRefs.board.current.scrollToOffset({
        offset: current.board.scrollOffset + 20,
        animated: false,
      });
    }
    if (current.x < 100) {
      flatListRefs.board.current.scrollToOffset({
        offset: current.board.scrollOffset - 20,
        animated: false,
      });
    }
    // check if we are near the bottom or top
    if (current.y + 100 > current[current.pointingList].flatListHeight) {
      flatListRefs[current.pointingList].current.scrollToOffset({
        offset: current[current.pointingList].scrollOffset + 20,
        animated: false,
      });
    } else if (current.y < 100) {
      flatListRefs[current.pointingList].current.scrollToOffset({
        offset: current[current.pointingList].scrollOffset - 20,
        animated: false,
      });
    }

    const pointed = current.x + current.board.scrollOffset;
    if (pointed < sizeW(100) && current.pointingList !== 'backlog') {
      current.pointingList = 'backlog';
      reoderBoard();
      return;
    } else if (
      pointed > sizeW(100) &&
      pointed < sizeW(200) &&
      current.pointingList !== 'inprogress'
    ) {
      current.pointingList = 'inprogress';
      reoderBoard();
      return;
    } else if (pointed > sizeW(200) && current.pointingList !== 'done') {
      current.pointingList = 'done';
      reoderBoard();
      return;
    }
    // check y value see if we need to reorder
    const newIdx = yToIndex(current.y, false);
    if (dragging.index !== newIdx && board[current.pointingList > 1]) {
      setBoard({
        ...board,
        [current.pointingList]: {
          ...board[current.pointingList],
          data: immutableMove(
            board[current.pointingList].data,
            dragging.index,
            newIdx,
          ),
        },
      });
      setDraggingItem({...dragging, index: newIdx});
    }
    // animateList();
    // });
  };

  const reset = () => {
    console.log('reset');
    current.active = false;
    setDraggingItem({index: -1, list: '', item: {}});
  };

  const _panResponder = PanResponder.create({
    // Ask to be the responder:
    onStartShouldSetPanResponder: (evt, gestureState) => dragging.index > -1,
    // onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => dragging.index > -1,
    // onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

    onPanResponderGrant: (evt, gestureState) => {
      // The gesture has started. Show visual feedback so the user knows
      // what is happening!
      // gestureState.d{x,y} will be set to zero now
      console.log('Grant', {...evt});
      Animated.event([{y: current.point.y}])({
        y: gestureState.y0 - current.rowHeight / 2,
      });
    },
    onPanResponderMove: (evt, gestureState) => {
      current.x = gestureState.moveX;
      current.y = gestureState.moveY;
      Animated.event([{x: current.point.x}, {y: current.point.y}])(
        {x: gestureState.dx},
        {y: gestureState.moveY - current.rowHeight / 2},
      );
      // The most recent move distance is gestureState.move{X,Y}
      // The accumulated gesture distance since becoming responder is
      // gestureState.d{x,y}
      animateList();
    },
    onPanResponderTerminationRequest: (evt, gestureState) => false,
    onPanResponderRelease: (evt, gestureState) => {
      // The user has released all touches while this view is the
      // responder. This typically means a gesture has succeeded
      reset();
    },
    onPanResponderTerminate: (evt, gestureState) => {
      // Another component has become the responder, so this gesture
      // should be cancelled
      reset();
    },
    onShouldBlockNativeResponder: (evt, gestureState) => {
      // Returns whether this component should block native components from becoming the JS
      // responder. Returns true by default. Is currently only supported on android.
      return true;
    },
  });

  const _startDragging = (index, list, item) => {
    console.log('onLongPress startDragging', index);
    if (index < 0) return;
    setDraggingItem({index, list, item});
    current.active = true;
  };

  const renderItem = ({item, index}, list) => (
    <View
      onLayout={e => {
        current.rowHeight = e.nativeEvent.layout.height;
      }}
      style={{
        opacity: dragging.index === index && list === dragging.list ? 0.25 : 1,
      }}>
      <TouchableOpacity
        style={{
          padding: 16,
          margin: sizeW(1.4),
          backgroundColor: colorMap[item.i],
          flexDirection: 'row',
        }}
        onLongPress={() => _startDragging(index, list, item)}>
        <Text style={{fontSize: 28}}>@</Text>
        <Text style={{fontSize: 22, textAlign: 'center', flex: 1}}>
          {item.i}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {dragging.index > -1 && (
        <Animated.View
          style={{
            position: 'absolute',
            backgroundColor: 'black',
            zIndex: 2,
            width: sizeW(95),
            top: current.point.getLayout().top,
            left: current.point.getLayout().left,
          }}>
          {renderItem({item: dragging.item, index: -1}, '')}
        </Animated.View>
      )}
      <View {..._panResponder.panHandlers}>
        <FlatList
          ref={flatListRefs.board}
          style={{width: sizeW(100)}}
          horizontal
          keyExtractor={item => '' + item.id}
          data={BOARD}
          scrollEnabled={dragging.index < 0}
          onScroll={e => {
            current.board.scrollOffset = e.nativeEvent.contentOffset.x;
          }}
          // snapping
          decelerationRate={'fast'}
          snapToInterval={sizeW(90)} //your element width
          snapToAlignment={'center'}
          // End snapping
          renderItem={listData => {
            const listName = listData.item.name;
            return (
              <FlatList
                ref={flatListRefs[listName]}
                scrollEnabled={dragging.index < 0}
                style={{width: sizeW(90)}}
                data={board[listName].data}
                renderItem={({item, index}) =>
                  renderItem({item, index}, listName)
                }
                onScroll={e => {
                  current[listName].scrollOffset =
                    e.nativeEvent.contentOffset.y;
                }}
                onLayout={e => {
                  current[listName].flatlistTopOffset = e.nativeEvent.layout.y;
                  current[listName].flatListHeight =
                    e.nativeEvent.layout.height;
                }}
                scrollEventThrottle={16}
                keyExtractor={keyItem => '' + keyItem.id}
              />
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default DragAndDrop;
