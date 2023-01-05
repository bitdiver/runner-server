@bitdiver/runner-server / [Exports](modules.md)

# Runner Server

This test runner is executing the tests. There are two general execution
modes. In the normal mode it will executes the first test case with all
its steps. Then the next test case. In the parallel mode it executes the
firts step for all the test cases and then the next step.

Excution mode "normal"  
The following pictures shows the test execution for a normal flow:

![ExecutionNormal](images/ExecutionNormal.svg)

Excution mode "paralell"  
In this mode it first executes the first step for all the test cases.

![ExecutionParalell](images/ExecutionParalell.svg)

This mode has a special feature for steps affects all tests. Lets assume
there is a step which clears the data base. This will affect all test
cases. For these kind of steps there is something called 'SingleStep'.

The following pictures shows a 'SingleStep' for step 3.

![ExecutionParalellSingleStep](images/ExecutionParalellSingleStep.svg)

## Why do I need this?

This is always the first question. Why schould I use such a runner?

This runner was developed to test system which have are having batch
executions or long running steps. Lets assume there is a sytem which
creates billing information. And the billing runs for 20 minutes.
Regardless if you have one customer or 100 customers. If you test this
system one test case after an other you always have these 20 minutes
delay. But when you first insert all customers for each test cases and
then inserts all the events for all customers and then you start the
billing, it will also have these 20 minutes delay, but only once.

An other case is where you need to test a system in real time. So you do
something and then have to wait two minutes for what ever reason, then
do the next step and have to wait again. Then it makes sence to use this
runner. One of the case where it was used is to simulate trains driving
from one station to an other. So the runner is driving many trains in
parallel. One train per test case. But for each train there a timings
when reaching a station, wait at the station and then starts to the
next.
