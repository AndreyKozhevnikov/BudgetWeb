function aggregatedList(req, res, next) {
  Account.aggregate(
    [
      {
        $lookup: {
          from: 'paymenttypes',
          localField: '_id',
          foreignField: 'Account',
          as: 'acPayments',
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'acPayments._id',
          foreignField: 'PaymentType',
          as: 'goodOrders',
        },
      },
      // {
      //   $lookup: {
      //     from: 'paymenttypes',
      //     let: { myid: '$_id' },
      //     pipeline: [
      //       {
      //         $match:
      //         {
      //           $expr: {
      //             $eq: ['$Account', '$$myid'],
      //            // $eq: ['$LocalId', 55],

      //           },
      //         },
      //       },
      //     ],
      //     as: 'testPayments',
      //   },
      // },
      {
        $lookup: {
          from: 'orders',
          let: { myid123123: '$acPayments._id' },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$PaymentType', '$$myid123123'],
                  //$eq: ['$Value', 100],

                },
              },
            },
            // { $project: { stock_item: 0, _id: 0 } },
          ],
          as: 'testOrders',
        },
      },
      {
        $lookup: {
          from: 'orders',
          //let: { value: '$value' },
          //let: { order_item: '$acPayments' },
          pipeline: [
            {
              $match:
              {
                $expr:
                  //  {
                  //   $and: [
                  { $eq: ['$Value', 100] },
                // { $ne: [100, '$value'] },
                // ],
                // },
              },
            },
          ],
          as: 'myOrders',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          localField: '_id',
          foreignField: 'AccountOut',
          as: 'acOutSOrders',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          localField: '_id',
          foreignField: 'AccountIn',
          as: 'acInSOrders',
        },
      },
      // {
      //   $unwind: '$acPayments',
      // },
      // {
      //   $project: {
      //     myname: { name: '$Name', myId: '$_id' },
      //     sumPayments: { $sum: '$myOrders.Value' },
      //     sumInSOrders: { $sum: '$acInSOrders.Value' },
      //     sumOutSOrders: { $sum: '$acOutSOrders.Value' },
      //   },
      // },
    ],
    function(err, accList) {
      if (err) {
        next(err);
      }
      let commonSum = 0;
      accList.forEach((item) => {
        item.result = item.sumInSOrders - item.sumOutSOrders - item.sumPayments;
        commonSum = commonSum + item.result;
      });
      res.render('account_list_aggregate', { title: 'Account List', list_account: accList, commonSum: commonSum });
    }
  );